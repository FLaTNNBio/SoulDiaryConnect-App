from django.shortcuts import render, redirect, get_object_or_404
from .models import Medico, Paziente, NotaDiario, RiassuntoCasoClinico
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from datetime import timedelta
import logging
import json
import threading

logger = logging.getLogger(__name__)

def medico_home(request):
    if request.session.get('user_type') != 'medico':
        return redirect('/login/')

    medico_id = request.session.get('user_id')
    medico = get_object_or_404(Medico, codice_identificativo=medico_id)

    # Lista dei pazienti
    pazienti = Paziente.objects.filter(med=medico)

    # Paziente selezionato
    paziente_id = request.GET.get('paziente_id')
    paziente_selezionato = Paziente.objects.filter(codice_fiscale=paziente_id).first()

    # Note del paziente selezionato
    note_diario = NotaDiario.objects.filter(paz=paziente_selezionato).order_by('-data_nota') if paziente_selezionato else None

    # Aggiungi le emoji alle note per il template
    if note_diario:
        for nota in note_diario:
            nota.emoji = get_emoji_for_emotion(nota.emozione_predominante)
            nota.emotion_category = get_emotion_category(nota.emozione_predominante)
            nota.context_emoji = get_emoji_for_context(nota.contesto_sociale)

    return render(request, 'SoulDiaryConnectApp/medico_home.html', {
        'medico': medico,
        'pazienti': pazienti,
        'paziente_selezionato': paziente_selezionato,
        'note_diario': note_diario,
    })

def paziente_home(request):
    if request.session.get('user_type') != 'paziente':
        return redirect('/login/')

    paziente_id = request.session.get('user_id')
    if not paziente_id:
        return redirect('/login/')

    paziente = Paziente.objects.get(codice_fiscale=paziente_id)

    try:
        medico = paziente.med
    except Medico.DoesNotExist:
        medico = None
        print("Nessun medico trovato associato a questo paziente.")

    if request.method == 'POST':
        testo_paziente = request.POST.get('desc')
        generate_response_flag = request.POST.get('generateResponse') == 'on'
        testo_supporto = ""
        is_emergency = False
        tipo_emergenza = 'none'
        messaggio_emergenza = None

        if testo_paziente:
            # PRIMA: Controlla se c'è un contenuto di crisi/emergenza
            is_emergency, tipo_emergenza = rileva_contenuto_crisi(testo_paziente)

            if is_emergency:
                # Se è una situazione di emergenza, genera il messaggio di sicurezza
                # e NON genera il supporto automatico dell'LLM
                messaggio_emergenza = genera_messaggio_emergenza(tipo_emergenza, medico)
                testo_supporto = ""  # Non generare supporto LLM in emergenza
                logger.warning(f"EMERGENZA RILEVATA per paziente {paziente.codice_fiscale} - Tipo: {tipo_emergenza}")
            else:
                # Situazione normale: genera supporto se richiesto
                if generate_response_flag:
                    testo_supporto = genera_frasi_di_supporto(testo_paziente, paziente)

            # Crea la nota immediatamente con il supporto generato
            # L'analisi clinica e sentiment verranno generati in background
            nota = NotaDiario.objects.create(
                paz=paziente,
                testo_paziente=testo_paziente,
                testo_supporto=testo_supporto,
                testo_clinico="",  # Sarà generato in background
                emozione_predominante="",
                spiegazione_emozione="",
                contesto_sociale="",
                spiegazione_contesto="",
                data_nota=timezone.now(),
                is_emergency=is_emergency,
                tipo_emergenza=tipo_emergenza,
                messaggio_emergenza=messaggio_emergenza,
                generazione_in_corso=True  # Flag per indicare che la generazione è in corso
            )

            # Avvia la generazione dell'analisi clinica in background
            thread = threading.Thread(
                target=genera_analisi_in_background,
                args=(nota.id, testo_paziente, medico, paziente)
            )
            thread.daemon = True
            thread.start()

        # PRG Pattern: Redirect dopo POST per evitare duplicazione note al refresh
        return redirect('paziente_home')

    note_diario = NotaDiario.objects.filter(paz=paziente).order_by('-data_nota')

    return render(request, 'SoulDiaryConnectApp/paziente_home.html', {
        'paziente': paziente,
        'note_diario': note_diario,
        'medico': medico,
    })

def controlla_stato_generazione(request, nota_id):
    """
    View AJAX per controllare lo stato di generazione di una nota.
    Usata dal lato medico per aggiornare la UI quando la generazione è completata.
    """
    try:
        nota = NotaDiario.objects.get(id=nota_id)
        return JsonResponse({
            'generazione_in_corso': nota.generazione_in_corso,
            'testo_clinico': nota.testo_clinico if not nota.generazione_in_corso else None,
            'emozione_predominante': nota.emozione_predominante if not nota.generazione_in_corso else None,
            'spiegazione_emozione': nota.spiegazione_emozione if not nota.generazione_in_corso else None,
            'contesto_sociale': nota.contesto_sociale if not nota.generazione_in_corso else None,
            'spiegazione_contesto': nota.spiegazione_contesto if not nota.generazione_in_corso else None,
        })
    except NotaDiario.DoesNotExist:
        return JsonResponse({'error': 'Nota non trovata'}, status=404)

def personalizza_generazione(request):
    if request.session.get('user_type') != 'medico':
        return redirect('/login/')

    medico_id = request.session.get('user_id')
    medico = Medico.objects.get(codice_identificativo=medico_id)

    if request.method == 'POST':
        # Tipo di Nota
        tipo_nota = request.POST.get('tipo_nota')
        medico.tipo_nota = True if tipo_nota == 'strutturato' else False

        # Lunghezza della Nota
        lunghezza_nota = request.POST.get('lunghezza_nota')
        medico.lunghezza_nota = True if lunghezza_nota == 'lungo' else False

        # Concatenazione di tipo_parametri e testo_parametri
        tipo_parametri = request.POST.getlist('tipo_parametri')
        testo_parametri = request.POST.getlist('testo_parametri')
        medico.tipo_parametri = ".:;!".join(tipo_parametri)
        medico.testo_parametri = ".:;!".join(testo_parametri)

        medico.save()
        return redirect('medico_home')

    # Suddivide i parametri già salvati in liste per visualizzarli nella tabella
    tipo_parametri = medico.tipo_parametri.split(".:;!") if medico.tipo_parametri else []
    testo_parametri = medico.testo_parametri.split(".:;!") if medico.testo_parametri else []

    return render(request, 'SoulDiaryConnectApp/personalizza_generazione.html', {
        'medico': medico,
        'tipo_parametri': zip(tipo_parametri, testo_parametri),
    })

def genera_frase_supporto_nota(request, nota_id):
    """
    View per generare la frase di supporto per una nota specifica che non ce l'ha.
    """
    if request.session.get('user_type') != 'paziente':
        return redirect('/login/')

    nota = get_object_or_404(NotaDiario, id=nota_id)

    # Sicurezza: solo il proprietario può generare la frase di supporto
    if nota.paz.codice_fiscale != request.session.get('user_id'):
        return redirect('/paziente/home/')

    if request.method == 'POST':
        # Genera la frase di supporto se non esiste già
        if not nota.testo_supporto or nota.testo_supporto.strip() == '':
            testo_supporto = genera_frasi_di_supporto(nota.testo_paziente, nota.paz)
            nota.testo_supporto = testo_supporto
            nota.save(update_fields=["testo_supporto"])

        return redirect('/paziente/home/')

    return redirect('/paziente/home/')