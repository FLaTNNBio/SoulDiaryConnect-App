from django.utils import timezone
from django.http import JsonResponse
from .auth_views import token_required
from ..models import Medico, NotaDiario, Paziente
import logging
from django.views.decorators.csrf import csrf_exempt
from .utils.utils import get_emoji_for_context, get_emoji_for_emotion

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
        nota = NotaDiario.objects.get(
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
            "commento_medico": nota.testo_medico or "",
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