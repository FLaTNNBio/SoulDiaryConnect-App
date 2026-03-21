import json
import threading
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.utils.timezone import now, localtime
from datetime import datetime
from ..models import Paziente, NotaDiario
from .auth_views import token_required  
from .utils.ai import (
    genera_messaggio_emergenza,
    genera_frasi_di_supporto,
    rileva_contenuto_crisi,
    genera_analisi_in_background
)

logger = logging.getLogger(__name__)

@csrf_exempt
@token_required 
def create_nota(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)

    if getattr(request, 'user_type', None) != 'paziente':
        return JsonResponse({"status": "error", "message": "Accesso negato. Solo i pazienti possono creare note nel diario."}, status=403)

    try:
        paziente_id = request.user_id
        paziente = Paziente.objects.get(codice_fiscale=paziente_id)
        medico = paziente.med

        data = json.loads(request.body)
        testo_paziente = data.get('testo', '').strip()
        generate_response_flag = data.get('aiSupport', False)

        if not testo_paziente:
            return JsonResponse({"status": "error", "message": "Il testo della nota non può essere vuoto."}, status=400)

        testo_supporto = ""
        is_emergency, tipo_emergenza = rileva_contenuto_crisi(testo_paziente)
        messaggio_emergenza = None
        
        if is_emergency:
            messaggio_emergenza = genera_messaggio_emergenza(tipo_emergenza, medico)
        else:
            if generate_response_flag:
                testo_supporto = genera_frasi_di_supporto(testo_paziente, paziente)

        orario_per_db = datetime.now()
        print(f"Data salvataggio nota (Locale): {orario_per_db}")

        nota = NotaDiario.objects.create(
            paz=paziente,
            testo_paziente=testo_paziente,
            testo_supporto=testo_supporto,
            testo_clinico="",  
            data_nota=orario_per_db,
            is_emergency=is_emergency,
            tipo_emergenza=tipo_emergenza,
            messaggio_emergenza=messaggio_emergenza,
            generazione_in_corso=True
        )

        thread = threading.Thread(
            target=genera_analisi_in_background,
            args=(nota.id, testo_paziente, medico, paziente)
        )
        thread.daemon = True
        thread.start()

        return JsonResponse({
            "status": "success", 
            "message": "Nota salvata con successo", 
            "data": {"nota_id": nota.id}
        }, status=201)

    except Paziente.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Paziente non trovato nel sistema."}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Formato dati non valido (JSON atteso)."}, status=400)
    except Exception as e:
        logger.error(f"Errore nella creazione della nota: {str(e)}")
        return JsonResponse({"status": "error", "message": f"Errore interno del server: {str(e)}"}, status=500)
    

@csrf_exempt
@token_required
def generate_note_support(request, nota_id):
    """
    View to generate the supporting phrase for a specific note that doesn't have one.
    """
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Metodo non consentito. Usa POST."}, status=405)

    if request.user_type != 'paziente':
        return JsonResponse({"status": "error", "message": "Accesso negato. Solo i pazienti possono eseguire questa azione."}, status=403)

    try:
        # We retrieve the patient via token
        paziente = Paziente.objects.get(codice_fiscale=request.user_id)
        
        # Security: We search for the note and make sure it belongs to this patient
        nota = NotaDiario.objects.get(id=nota_id, paz=paziente)

        # If there isn't already a supporting sentence, we generate it.
        if not nota.testo_supporto or nota.testo_supporto.strip() == '':
            testo_supporto = genera_frasi_di_supporto(nota.testo_paziente, paziente)
            nota.testo_supporto = testo_supporto
            nota.save(update_fields=["testo_supporto"])
            
            return JsonResponse({
                "status": "success", 
                "message": "Frase generata con successo.", 
                "testo_supporto": testo_supporto
            })
        else:
            return JsonResponse({
                "status": "success", 
                "message": "Frase già esistente.", 
                "testo_supporto": nota.testo_supporto
            })

    except NotaDiario.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Nota non trovata o non autorizzato."}, status=404)
    except Paziente.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Paziente non trovato."}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@token_required 
def get_note(request):
    """
    Recupera l'elenco di tutte le note del paziente loggato, gestendo i fusi orari.
    """
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)

    if getattr(request, 'user_type', None) != 'paziente':
        return JsonResponse({"status": "error", "message": "Accesso negato."}, status=403)

    try:
        paziente_id = request.user_id
        paziente = Paziente.objects.get(codice_fiscale=paziente_id)

        # Recupera tutte le note ordinate dalla più recente
        note_db = NotaDiario.objects.filter(paz=paziente).order_by('-data_nota')

        note_list = []
        for nota in note_db:
            dt = nota.data_nota
            
            # --- CORREZIONE TZ ---
            if dt:
                if timezone.is_aware(dt):
                    data_locale = timezone.localtime(dt)
                else:
                    data_locale = timezone.make_aware(dt)
                data_iso = data_locale.isoformat()
            else:
                data_iso = None
            
            note_list.append({
                "id": nota.id,
                "testo": nota.testo_paziente,
                "data_iso": data_iso,
                "emozione": nota.emozione_predominante,
                "generazione_in_corso": nota.generazione_in_corso
            })

        return JsonResponse({
            "status": "success", 
            "data": note_list
        }, status=200)

    except Paziente.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Paziente non trovato."}, status=404)
    except Exception as e:
        logger.error(f"Errore nel recupero delle note: {str(e)}")
        return JsonResponse({"status": "error", "message": "Errore interno durante il recupero delle note."}, status=500)


@token_required
def get_patient_info(request):
    """Restituisce le info personali del paziente loggato in modo sicuro"""
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)
    try:
        # Recupera il paziente usando l'ID dal token
        paziente = Paziente.objects.get(codice_fiscale=request.user_id)
        
        # Gestione sicura della data di nascita per evitare crash 500
        data_formattata = ""
        if paziente.data_di_nascita:
            data_formattata = paziente.data_di_nascita.strftime('%d/%m/%Y')

        return JsonResponse({
            "status": "success",
            "data": {
                "nome": paziente.nome,
                "cognome": paziente.cognome,
                "email": paziente.email,
                "data_nascita": data_formattata,
                "codice_fiscale": paziente.codice_fiscale
            }
        })
    except Paziente.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Paziente non trovato"}, status=404)
    except Exception as e:
        # Restituisce l'errore esatto per aiutarti nel debug
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@token_required
def get_doctor_info(request):
    """Restituisce le info del medico associato al paziente loggato"""
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)
    try:
        paziente = Paziente.objects.get(codice_fiscale=request.user_id)
        medico = paziente.med # 'med' è il nome della ForeignKey nel tuo modello
        
        if not medico:
            return JsonResponse({"status": "error", "message": "Nessun medico associato al tuo profilo"}, status=404)
        
        return JsonResponse({
            "status": "success",
            "data": {
                "nome": f"Dott. {medico.nome} {medico.cognome}",
                "specializzazione": "Psicoterapeuta",
                "email": medico.email,
                "indirizzo": medico.indirizzo_studio,
                "telefono": medico.numero_telefono_studio,
                "cellulare": medico.numero_telefono_cellulare,
            }
        })
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    

# @token_required
# def get_note_details(request, pk):
#     """Recupera i dettagli di una singola nota"""
#     if request.method != 'GET':
#         return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)
    
#     try:
#         paziente = Paziente.objects.get(codice_fiscale=request.user_id)
#         nota = NotaDiario.objects.get(pk=pk, paz=paziente)

#         return JsonResponse({
#             "status": "success",
#             "data": {
#                 "id": nota.id,
#                 "data_formattata": nota.data_nota.strftime('%d/%m/%Y') if nota.data_nota else "",
#                 "ora": nota.data_nota.strftime('%H:%M') if nota.data_nota else "",
#                 "testo_paziente": nota.testo_paziente,
#                 "testo_supporto": nota.testo_supporto,
#                 "emozione": nota.emozione_predominante,
#                 "spiegazione_emozione": nota.spiegazione_emozione,
#                 "contesto": nota.contesto_sociale,
#                 "spiegazione_contesto": nota.spiegazione_contesto,
#                 "generazione_in_corso": nota.generazione_in_corso
#             }
#         })
#     except NotaDiario.DoesNotExist:
#         return JsonResponse({"status": "error", "message": "Nota non trovata"}, status=404)
#     except Exception as e:
#         return JsonResponse({"status": "error", "message": str(e)}, status=500)

from .utils.utils import get_emoji_for_emotion, get_emoji_for_context # Ricorda questi import se servono

@token_required
def get_note_details(request, pk):
    """Recupera i dettagli di una singola nota"""
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)
    
    try:
        # Usa select_related per ottimizzare la query del medico
        paziente = Paziente.objects.select_related('med').get(codice_fiscale=request.user_id)
        nota = NotaDiario.objects.get(pk=pk, paz=paziente)

        return JsonResponse({
            "status": "success",
            "data": {
                "id": nota.id,
                "data_formattata": nota.data_nota.strftime('%d/%m/%Y') if nota.data_nota else "",
                "ora": nota.data_nota.strftime('%H:%M') if nota.data_nota else "",
                "testo_paziente": nota.testo_paziente,
                "testo_supporto": nota.testo_supporto,
                "emozione": nota.emozione_predominante,
                "emozione_emoji": get_emoji_for_emotion(nota.emozione_predominante), # Aggiunto
                "spiegazione_emozione": nota.spiegazione_emozione,
                "contesto": nota.contesto_sociale,
                "contesto_emoji": get_emoji_for_context(nota.contesto_sociale), # Aggiunto
                "spiegazione_contesto": nota.spiegazione_contesto,
                "generazione_in_corso": nota.generazione_in_corso,
                
                # --- AGGIUNTE PER VISUALIZZARE IL COMMENTO DEL MEDICO ---
                "commento_medico": nota.testo_medico or "",
                "data_commento_formattata": nota.data_commento_medico.strftime('%d/%m/%Y alle %H:%M') if nota.data_commento_medico else "",
                "nome_medico": f"Dott. {paziente.med.nome} {paziente.med.cognome}" if paziente.med else "Dottore"
                # ---------------------------------------------------------
            }
        })
    except NotaDiario.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Nota non trovata"}, status=404)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
@token_required
def delete_nota(request, pk):
    """Delete a specific note"""
    
    if request.method != 'DELETE':
        return JsonResponse({"status": "error", "message": "Metodo non consentito. Usa DELETE."}, status=405)
    
    if request.user_type != 'paziente':
        return JsonResponse({"status": "error", "message": "Accesso negato. Solo i pazienti possono eliminare le proprie note."}, status=403)
    
    try:
        paziente = Paziente.objects.get(codice_fiscale=request.user_id)
        nota = NotaDiario.objects.get(pk=pk, paz=paziente)
        nota.delete()
        return JsonResponse({"status": "success", "message": "Nota eliminata con successo."})
        
    except NotaDiario.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Nota non trovata o non autorizzato a eliminarla."}, status=404)
    except Paziente.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Profilo paziente non trovato."}, status=404)