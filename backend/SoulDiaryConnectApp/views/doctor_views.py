from django.utils import timezone
from django.http import JsonResponse
from .utils.prompt import get_summary_prompt
from .utils.ai import genera_con_ollama, genera_frasi_cliniche
from .auth_views import token_required
from ..models import Medico, NotaDiario, Paziente, RiassuntoCasoClinico
import logging
from django.views.decorators.csrf import csrf_exempt
from .utils.utils import get_emoji_for_context, get_emoji_for_emotion
import json

logger = logging.getLogger(__name__)

@token_required
def get_doctor_profile(request):
    """
    Returns the profile information of the logged in doctor.
    """
    # Security: we guarantee that the person making the request is actually a doctor.
    if request.user_type != 'medico':
        return JsonResponse({
            'status': 'error', 
            'message': 'Accesso negato. Non sei autorizzato.'
        }, status=403)
    
    try:
        # Retrieve the doctor using the ID extracted from the Token (request.user_id)
        medico = Medico.objects.get(codice_identificativo=request.user_id)
        
        # Package the data needed by the React Native frontend
        data = {
            'nome': medico.nome,
            'cognome': medico.cognome,
            'email': medico.email,
            'indirizzo_studio': medico.indirizzo_studio,
            'citta': medico.citta,
            'numero_civico': medico.numero_civico,
            'numero_telefono_studio': medico.numero_telefono_studio,
            'numero_telefono_cellulare': medico.numero_telefono_cellulare,
        }
        
        # Successfully return the data
        return JsonResponse({
            'status': 'success', 
            'data': data
        })
        
    except Medico.DoesNotExist:
        return JsonResponse({
            'status': 'error', 
            'message': 'Medico non trovato nel database.'
        }, status=404)
    

@token_required
def get_doctor_patients(request):
    """
    Returns the list of patients associated with the logged in doctor.
    """
    # Security check
    if request.user_type != 'medico':
        return JsonResponse({
            'status': 'error', 
            'message': 'Accesso negato. Solo i medici possono vedere la lista pazienti.'
        }, status=403)
    
    try:
        # Find all patients whose doctor matches the token ID
        pazienti = Paziente.objects.filter(med_id=request.user_id).values(
            'codice_fiscale', 
            'nome', 
            'cognome', 
            'data_di_nascita', 
            'email'
        )
        
        lista_pazienti = list(pazienti)
        
        return JsonResponse({
            'status': 'success', 
            'data': lista_pazienti
        })
        
    except Exception as e:
        return JsonResponse({
            'status': 'error', 
            'message': str(e)
        }, status=500)


@token_required
def get_patient_details(request, codice_fiscale):
    """
    Returns the details of a single patient, verifying that it belongs to the doctor.
    """
    if request.user_type != 'medico':
        return JsonResponse({
            'status': 'error', 
            'message': 'Non autorizzato'
        }, status=403)
    
    try:
        # We use med_id=request.user_id to make sure one doctor can't spy on another doctor's patients!
        paziente = Paziente.objects.get(codice_fiscale=codice_fiscale, med_id=request.user_id)
        
        data = {
            'nome': paziente.nome,
            'cognome': paziente.cognome,
            'codice_fiscale': paziente.codice_fiscale,
            # Format the date in a readable format (e.g. 01/12/1990)
            'data_di_nascita': paziente.data_di_nascita.strftime('%d/%m/%Y') if paziente.data_di_nascita else 'N/D',
        }
        
        return JsonResponse({
            'status': 'success', 
            'data': data
        })
        
    except Paziente.DoesNotExist:
        return JsonResponse({
            'status': 'error', 
            'message': 'Paziente non trovato o non autorizzato'
        }, status=404)


@token_required
def get_patient_notes(request, codice_fiscale):
    """
    Returns a list of notes for a specific patient for the Doctor view.
    """
    # Security check: only doctors can access
    if request.user_type != 'medico':
        return JsonResponse({'status': 'error', 'message': 'Non autorizzato'}, status=403)
    
    try:
        # 1. Verifichiamo che il paziente appartenga al medico loggato (request.user_id)
        paziente = Paziente.objects.get(codice_fiscale=codice_fiscale, med_id=request.user_id)
        
        # 2. Recuperiamo le note
        note_db = NotaDiario.objects.filter(paz=paziente).order_by('-data_nota')
        
        note_list = []
        for nota in note_db:
            dt = nota.data_nota
            data_iso = None
            
            # Gestione fuso orario sicura
            if dt and hasattr(dt, 'isoformat'):
                # Rendiamo la data aware se non lo è e convertiamo in locale
                data_locale = timezone.localtime(dt) if timezone.is_aware(dt) else timezone.make_aware(dt)
                data_iso = data_locale.isoformat()
                
            note_list.append({
                "id": nota.id,
                "data_iso": data_iso,
                "testo": nota.testo_paziente,
                "emozione": nota.emozione_predominante,
                "generazione_in_corso": nota.generazione_in_corso
            })

        return JsonResponse({'status': 'success', 'data': note_list})
        
    except Paziente.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Paziente non trovato o non associato a te'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@token_required
def get_pat_note_details(request, codice_fiscale, note_id):
    try:
        # select_related('paz__med') è opzionale ma ottimizza la query per recuperare subito i dati del medico
        nota = NotaDiario.objects.select_related('paz__med').get(
            id=note_id, 
            paz__codice_fiscale=codice_fiscale, 
            paz__med_id=request.user_id
        )
        
        data = {
            "id": nota.id,
            "testo_paziente": nota.testo_paziente,
            "testo_supporto": nota.testo_supporto or "",
            "testo_clinico": nota.testo_clinico or "",
            
            # Testo Emozione + Emoji recuperata dalle costanti tramite utility
            "emozione": nota.emozione_predominante or "", 
            "emozione_emoji": get_emoji_for_emotion(nota.emozione_predominante),
            "spiegazione_emozione": nota.spiegazione_emozione or "",
            
            # Testo Contesto + Emoji recuperata dalle costanti tramite utility
            "contesto": nota.contesto_sociale or "",
            "contesto_emoji": get_emoji_for_context(nota.contesto_sociale),
            "spiegazione_contesto": nota.spiegazione_contesto or "",
            
            "data_formattata": nota.data_nota.strftime('%d/%m/%Y') if nota.data_nota else "",
            "ora": nota.data_nota.strftime('%H:%M') if nota.data_nota else "",
            
            # --- CAMPI AGGIUNTI PER IL COMMENTO DEL MEDICO ---
            "commento_medico": nota.testo_medico or "",
            "data_commento_formattata": nota.data_commento_medico.strftime('%d/%m/%Y alle %H:%M') if nota.data_commento_medico else "",
            "nome_medico": f"Dott. {nota.paz.med.nome} {nota.paz.med.cognome}",
            # -------------------------------------------------
            
            "is_emergency": nota.is_emergency,
            "tipo_emergenza": nota.tipo_emergenza,
            "generazione_in_corso": nota.generazione_in_corso
        }
        
        return JsonResponse({"status": "success", "data": data})
        
    except NotaDiario.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Nota non trovata"}, status=404)
    except Exception as e:
        print(f"Errore caricamento nota: {str(e)}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@csrf_exempt
@token_required
def add_clinical_comment(request, note_id):
    if request.user_type != 'medico':
        return JsonResponse({"status": "error", "message": "Non autorizzato"}, status=403)

    if request.method == 'POST':
        try:
            # Estraiamo i dati dal JSON inviato dall'app
            data = json.loads(request.body)
            testo_medico = data.get('commento', '').strip()

            # Recuperiamo la nota, assicurandoci che il paziente sia assegnato a questo medico
            nota = NotaDiario.objects.get(
                id=note_id, 
                paz__med_id=request.user_id
            )

            # --- LA MAGIA AVVIENE QUI ---
            # Aggiorniamo il commento e salviamo l'ora esatta
            nota.testo_medico = testo_medico
            nota.data_commento_medico = timezone.now() 
            nota.save()

            # Prepariamo i dati formattati da rispedire subito al frontend
            data_formattata = nota.data_commento_medico.strftime('%d/%m/%Y alle %H:%M')
            # Recuperiamo il nome del medico navigando la relazione (nota -> paziente -> medico)
            nome_medico = f"Dott. {nota.paz.med.nome} {nota.paz.med.cognome}"

            return JsonResponse({
                "status": "success", 
                "message": "Valutazione clinica salvata con successo",
                "data": {
                    "commento_medico": nota.testo_medico,
                    "data_commento_formattata": data_formattata,
                    "nome_medico": nome_medico
                }
            })

        except NotaDiario.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Nota non trovata o non autorizzata"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Formato JSON non valido"}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
            
    return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)


@csrf_exempt
@token_required
def regenerate_clinical_analysis(request, note_id):
    """
    Rigenera l'analisi clinica automatica usando l'IA (Ollama).
    """
    if request.user_type != 'medico':
        return JsonResponse({"status": "error", "message": "Non autorizzato"}, status=403)

    if request.method == 'POST':
        try:
            # 1. Recuperiamo la nota e i relativi oggetti Medico e Paziente
            nota = NotaDiario.objects.select_related('paz', 'paz__med').get(
                id=note_id, 
                paz__med__codice_identificativo=request.user_id
            )

            print(f"Nota: {nota}\nMedico:{nota.paz.med}\nPaziente:{nota.paz}\nTesto Paziente:{nota.testo_paziente}")

            # 2. Chiamiamo l'IA per generare la nuova frase clinica
            nuova_analisi = genera_frasi_cliniche(
                testo=nota.testo_paziente, 
                medico=nota.paz.med, 
                paziente=nota.paz, 
                nota_id=nota.id
            )

            # 3. Aggiorniamo il database
            nota.testo_clinico = nuova_analisi
            # Usiamo update_fields per essere veloci ed evitare sovrascritture accidentali
            nota.save(update_fields=["testo_clinico"])

            # 4. Restituiamo il nuovo testo al frontend
            return JsonResponse({
                "status": "success", 
                "message": "Analisi clinica rigenerata con successo",
                "data": {
                    "testo_clinico": nota.testo_clinico
                }
            })

        except NotaDiario.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Nota non trovata o non autorizzata"}, status=404)
        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Errore AI: {str(e)}"}, status=500)
            
    return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)



# def riassunto_caso_clinico(request):
#     """
#     View per generare un riassunto del caso clinico di un paziente
#     basato sulle note di un periodo selezionato.
#     """
#     if request.session.get('user_type') != 'medico':
#         return redirect('/login/')

#     medico_id = request.session.get('user_id')
#     medico = get_object_or_404(Medico, codice_identificativo=medico_id)

#     paziente_id = request.GET.get('paziente_id')
#     periodo = request.GET.get('periodo', '7days')  # Default: ultimi 7 giorni

#     if not paziente_id:
#         messages.error(request, 'Seleziona un paziente.')
#         return redirect('medico_home')

#     paziente_selezionato = get_object_or_404(Paziente, codice_fiscale=paziente_id)

#     # Verifica che il paziente sia del medico loggato
#     if paziente_selezionato.med != medico:
#         messages.error(request, 'Non hai i permessi per visualizzare questo paziente.')
#         return redirect('medico_home')

#     # Calcola la data di inizio in base al periodo selezionato
#     oggi = timezone.now()

#     if periodo == '7days':
#         data_inizio = oggi - timedelta(days=7)
#         periodo_label = 'Ultimi 7 giorni'
#     elif periodo == '30days':
#         data_inizio = oggi - timedelta(days=30)
#         periodo_label = 'Ultimo mese'
#     elif periodo == '3months':
#         data_inizio = oggi - timedelta(days=90)
#         periodo_label = 'Ultimi 3 mesi'
#     elif periodo == 'year':
#         data_inizio = oggi - timedelta(days=365)
#         periodo_label = 'Ultimo anno'
#     else:
#         data_inizio = oggi - timedelta(days=7)
#         periodo_label = 'Ultimi 7 giorni'

#     # Recupera le note del periodo selezionato
#     note_periodo = NotaDiario.objects.filter(
#         paz=paziente_selezionato,
#         data_nota__gte=data_inizio
#     ).order_by('data_nota')

#     riassunto = None
#     data_generazione = None

#     # Controlla se è stata richiesta una nuova generazione
#     if request.method == 'POST' or request.GET.get('genera') == '1':
#         if note_periodo.exists():
#             # Costruisci il contesto per il riassunto
#             note_testo = []
#             for nota in note_periodo:
#                 nota_info = f"Data: {nota.data_nota.strftime('%d/%m/%Y')}"
#                 if nota.emozione_predominante:
#                     nota_info += f" | Emozione: {nota.emozione_predominante}"
#                 nota_info += f"\nNota paziente: {nota.testo_paziente}"
#                 if nota.testo_clinico:
#                     nota_info += f"\nAnalisi clinica: {nota.testo_clinico}"
#                 note_testo.append(nota_info)

#             contesto_note = "\n\n---\n\n".join(note_testo)

#             prompt = get_summary_prompt(paziente_selezionato, periodo_label, note_periodo, contesto_note)

#             riassunto = genera_con_ollama(prompt, max_chars=2000, temperature=0.5)
#             data_generazione = timezone.now()

#             # Salva o aggiorna il riassunto nel database
#             riassunto_obj, created = RiassuntoCasoClinico.objects.update_or_create(
#                 paz=paziente_selezionato,
#                 med=medico,
#                 periodo=periodo,
#                 defaults={
#                     'testo_riassunto': riassunto,
#                     'data_generazione': data_generazione,
#                 }
#             )
#         else:
#             riassunto = "Non sono presenti note nel periodo selezionato."
#             data_generazione = timezone.now()
#     else:
#         # Cerca un riassunto esistente nel database
#         riassunto_esistente = RiassuntoCasoClinico.objects.filter(
#             paz=paziente_selezionato,
#             med=medico,
#             periodo=periodo
#         ).first()

#         if riassunto_esistente:
#             riassunto = riassunto_esistente.testo_riassunto
#             data_generazione = riassunto_esistente.data_generazione

#     return render(request, 'SoulDiaryConnectApp/riassunto_caso_clinico.html', {
#         'medico': medico,
#         'paziente': paziente_selezionato,
#         'periodo': periodo,
#         'periodo_label': periodo_label,
#         'note_periodo': note_periodo,
#         'num_note': note_periodo.count(),
#         'riassunto': riassunto,
#         'data_generazione': data_generazione,
#     })

from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
# Assicurati di avere questi import nel tuo file doctor_views.py:
# from .models import Paziente, NotaDiario, RiassuntoCasoClinico
# from .utils.utils import genera_con_ollama, get_summary_prompt
# from .decorators import token_required

@csrf_exempt
@token_required
def get_or_generate_clinical_summary(request, paziente_id):
    """
    API per recuperare o generare un riassunto clinico di un paziente per un dato periodo.
    """
    if request.user_type != 'medico':
        return JsonResponse({"status": "error", "message": "Non autorizzato"}, status=403)

    if request.method == 'GET':
        try:
            # 1. Verifica permessi e recupera paziente
            paziente_selezionato = get_object_or_404(Paziente, codice_fiscale=paziente_id)
            
            if paziente_selezionato.med_id != request.user_id:
                return JsonResponse({"status": "error", "message": "Paziente non assegnato a questo medico."}, status=403)

            # 2. Gestione Parametri
            periodo = request.GET.get('periodo', '7days')
            forza_generazione = request.GET.get('genera', '0') == '1'

            # 3. Calcolo Finestra Temporale
            oggi = timezone.now()
            if periodo == '7days':
                data_inizio = oggi - timedelta(days=7)
                periodo_label = 'Ultimi 7 giorni'
            elif periodo == '30days':
                data_inizio = oggi - timedelta(days=30)
                periodo_label = 'Ultimo mese'
            elif periodo == '3months':
                data_inizio = oggi - timedelta(days=90)
                periodo_label = 'Ultimi 3 mesi'
            elif periodo == 'year':
                data_inizio = oggi - timedelta(days=365)
                periodo_label = 'Ultimo anno'
            else:
                data_inizio = oggi - timedelta(days=7)
                periodo_label = 'Ultimi 7 giorni'
                periodo = '7days' # fallback sicuro

            # 4. Recupero Note
            note_periodo = NotaDiario.objects.filter(
                paz=paziente_selezionato,
                data_nota__gte=data_inizio
            ).order_by('data_nota')

            riassunto_testo = None
            data_generazione = None

            # 5. Logica Principale: Generare o Recuperare?
            if forza_generazione:
                if note_periodo.exists():
                    # Costruisci il contesto per Ollama
                    note_testo = []
                    for nota in note_periodo:
                        nota_info = f"Data: {nota.data_nota.strftime('%d/%m/%Y')}"
                        if nota.emozione_predominante:
                            nota_info += f" | Emozione: {nota.emozione_predominante}"
                        nota_info += f"\nNota paziente: {nota.testo_paziente}"
                        if nota.testo_clinico:
                            nota_info += f"\nAnalisi clinica: {nota.testo_clinico}"
                        note_testo.append(nota_info)

                    contesto_note = "\n\n---\n\n".join(note_testo)

                    # Genera con IA
                    prompt = get_summary_prompt(paziente_selezionato, periodo_label, note_periodo, contesto_note)
                    riassunto_testo = genera_con_ollama(prompt, max_chars=2000, temperature=0.5)
                    data_generazione = timezone.now()

                    # Salva nel Database
                    RiassuntoCasoClinico.objects.update_or_create(
                        paz=paziente_selezionato,
                        med_id=request.user_id,
                        periodo=periodo,
                        defaults={
                            'testo_riassunto': riassunto_testo,
                            'data_generazione': data_generazione,
                        }
                    )
                else:
                    riassunto_testo = "Non sono presenti note nel periodo selezionato."
                    data_generazione = timezone.now()
            
            else:
                # Modalità Lettura: cerca un riassunto esistente
                riassunto_esistente = RiassuntoCasoClinico.objects.filter(
                    paz=paziente_selezionato,
                    med_id=request.user_id,
                    periodo=periodo
                ).first()

                if riassunto_esistente:
                    riassunto_testo = riassunto_esistente.testo_riassunto
                    data_generazione = riassunto_esistente.data_generazione

            # 6. Prepara la risposta JSON
            response_data = {
                "periodo_valore": periodo,
                "periodo_label": periodo_label,
                "numero_note_analizzate": note_periodo.count(),
                "testo_riassunto": riassunto_testo,
                "data_generazione": data_generazione.strftime('%d/%m/%Y alle %H:%M') if data_generazione else None,
                "ha_note": note_periodo.exists()
            }

            return JsonResponse({"status": "success", "data": response_data})

        except Paziente.DoesNotExist:
             return JsonResponse({"status": "error", "message": "Paziente non trovato."}, status=404)
        except Exception as e:
             print(f"Errore generazione riassunto: {str(e)}")
             return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Metodo non consentito"}, status=405)