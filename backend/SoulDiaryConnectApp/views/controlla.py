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

def get_emotion_category(emozione):
    """
    Restituisce la categoria dell'emozione per la colorazione CSS.
    """
    if not emozione:
        return 'neutral'
    emozione_lower = emozione.lower().strip()
    return EMOZIONI_CATEGORIE.get(emozione_lower, 'neutral')

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

def modifica_testo_medico(request, nota_id):
    if request.method == 'POST':
        nota = get_object_or_404(NotaDiario, id=nota_id)
        testo_medico = request.POST.get('testo_medico', '').strip()
        nota.testo_medico = testo_medico
        nota.save()
        return redirect(f'/medico/home/?paziente_id={nota.paz.codice_fiscale}')

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

def rigenera_frase_clinica(request):
    """
    View per rigenerare la frase clinica di una nota specifica (AJAX).
    """
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == 'POST' and is_ajax:
        nota_id = request.POST.get('nota_id')
        if not nota_id:
            return JsonResponse({'error': 'ID nota mancante.'}, status=400)
        try:
            nota = NotaDiario.objects.get(id=nota_id)
            medico = nota.paz.med
            paziente = nota.paz
            testo_paziente = nota.testo_paziente
            # Passa nota_id per escludere la nota corrente dal contesto
            nuova_frase = genera_frasi_cliniche(testo_paziente, medico, paziente, nota_id=nota.id)
            # Sostituisci la frase clinica precedente
            nota.testo_clinico = nuova_frase
            nota.save(update_fields=["testo_clinico"])
            return JsonResponse({'testo_clinico': nuova_frase})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Richiesta non valida.'}, status=400)

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

def analisi_paziente(request):
    """
    Pagina dedicata alle analisi del paziente selezionato
    """
    if request.session.get('user_type') != 'medico':
        return redirect('/login/')

    medico_id = request.session.get('user_id')
    medico = get_object_or_404(Medico, codice_identificativo=medico_id)

    # Paziente selezionato
    paziente_id = request.GET.get('paziente_id')
    if not paziente_id:
        messages.error(request, 'Nessun paziente selezionato.')
        return redirect('medico_home')

    paziente_selezionato = get_object_or_404(Paziente, codice_fiscale=paziente_id)

    # Verifica che il paziente sia del medico loggato
    if paziente_selezionato.med != medico:
        messages.error(request, 'Non hai i permessi per visualizzare questo paziente.')
        return redirect('medico_home')

    # Note del paziente
    note_diario = NotaDiario.objects.filter(paz=paziente_selezionato).order_by('-data_nota')

    # Prepara i dati per il grafico delle emozioni
    emotion_chart_data = None
    statistiche = None

    if note_diario.exists():
        # Ordina le note per data (dalla più vecchia alla più recente per il grafico)
        note_ordinate = note_diario.order_by('data_nota')

        # Prepara le liste per il grafico
        dates = []
        emotions = []
        emotion_values = []

        # Mappa le categorie a valori numerici per il grafico
        # Usa le stesse categorie di EMOZIONI_CATEGORIE per coerenza
        category_score_map = {
            'positive': 4,   # Emozioni positive (verde)
            'neutral': 3,    # Emozioni neutre (lilla)
            'anxious': 2,    # Emozioni ansiose (giallo)
            'negative': 1,   # Emozioni negative (rosso)
        }

        # Contatore per le statistiche
        contatore_emozioni = {}
        somma_valori = 0

        for nota in note_ordinate:
            if nota.emozione_predominante:
                emozione_lower = nota.emozione_predominante.lower()
                dates.append(nota.data_nota.strftime('%d/%m/%Y'))
                emotions.append(emozione_lower)

                # Ottieni la categoria dell'emozione e il valore corrispondente
                categoria = get_emotion_category(emozione_lower)
                score = category_score_map.get(categoria, 2)  # default: neutral
                emotion_values.append(score)
                somma_valori += score

                # Conta le emozioni
                contatore_emozioni[emozione_lower] = contatore_emozioni.get(emozione_lower, 0) + 1

        if dates:
            emotion_chart_data = {
                'dates': json.dumps(dates),
                'emotions': json.dumps(emotions),
                'values': json.dumps(emotion_values),
            }

            # Calcola statistiche
            media_emotiva = somma_valori / len(emotion_values) if emotion_values else 0
            emozione_piu_frequente = max(contatore_emozioni.items(), key=lambda x: x[1]) if contatore_emozioni else (None, 0)

            statistiche = {
                'totale_note': note_diario.count(),
                'media_emotiva': round(media_emotiva, 2),
                'emozione_frequente': emozione_piu_frequente[0],
                'emozione_frequente_count': emozione_piu_frequente[1],
                'emozione_frequente_emoji': get_emoji_for_emotion(emozione_piu_frequente[0]),
            }

    # Prepara i dati per le correlazioni umore-contesto sociale
    correlazione_contesto_data = None
    if note_diario.exists():
        # Raccogli dati per correlazione
        contesto_emozioni = {}  # {contesto: {'positive': n, 'neutral': n, 'anxious': n, 'negative': n, 'total': n, 'sum': n}}

        for nota in note_diario:
            contesto = nota.contesto_sociale
            emozione = nota.emozione_predominante

            if contesto and emozione:
                contesto_lower = contesto.lower().strip()
                emozione_lower = emozione.lower().strip()
                categoria_emozione = get_emotion_category(emozione_lower)

                if contesto_lower not in contesto_emozioni:
                    contesto_emozioni[contesto_lower] = {
                        'positive': 0,
                        'neutral': 0,
                        'anxious': 0,
                        'negative': 0,
                        'total': 0,
                        'sum': 0,
                        'emoji': get_emoji_for_context(contesto_lower),
                    }

                contesto_emozioni[contesto_lower][categoria_emozione] += 1
                contesto_emozioni[contesto_lower]['total'] += 1
                # Calcola il valore numerico per la media
                category_score_map = {'positive': 4, 'neutral': 3, 'anxious': 2, 'negative': 1}
                contesto_emozioni[contesto_lower]['sum'] += category_score_map.get(categoria_emozione, 2)

        if contesto_emozioni:
            # Ordina per numero totale di occorrenze (decrescente)
            contesti_ordinati = sorted(contesto_emozioni.items(), key=lambda x: x[1]['total'], reverse=True)

            # Prepara i dati per il grafico a barre raggruppate
            labels = []
            positive_data = []
            neutral_data = []
            anxious_data = []
            negative_data = []
            medie_contesto = []
            emojis = []

            for contesto, dati in contesti_ordinati:
                labels.append(contesto.title())
                positive_data.append(dati['positive'])
                neutral_data.append(dati['neutral'])
                anxious_data.append(dati['anxious'])
                negative_data.append(dati['negative'])
                media = round(dati['sum'] / dati['total'], 2) if dati['total'] > 0 else 0
                medie_contesto.append(media)
                emojis.append(dati['emoji'])

            # Trova contesto più positivo e più negativo
            contesto_migliore = max(contesti_ordinati, key=lambda x: x[1]['sum'] / x[1]['total'] if x[1]['total'] > 0 else 0)
            contesto_peggiore = min(contesti_ordinati, key=lambda x: x[1]['sum'] / x[1]['total'] if x[1]['total'] > 0 else 0)

            correlazione_contesto_data = {
                'labels': json.dumps(labels),
                'positive': json.dumps(positive_data),
                'neutral': json.dumps(neutral_data),
                'anxious': json.dumps(anxious_data),
                'negative': json.dumps(negative_data),
                'medie': json.dumps(medie_contesto),
                'emojis': json.dumps(emojis),
                'contesto_migliore': contesto_migliore[0].title(),
                'contesto_migliore_emoji': contesto_migliore[1]['emoji'],
                'contesto_migliore_media': round(contesto_migliore[1]['sum'] / contesto_migliore[1]['total'], 2) if contesto_migliore[1]['total'] > 0 else 0,
                'contesto_peggiore': contesto_peggiore[0].title(),
                'contesto_peggiore_emoji': contesto_peggiore[1]['emoji'],
                'contesto_peggiore_media': round(contesto_peggiore[1]['sum'] / contesto_peggiore[1]['total'], 2) if contesto_peggiore[1]['total'] > 0 else 0,
            }

    return render(request, 'SoulDiaryConnectApp/analisi_paziente.html', {
        'medico': medico,
        'paziente': paziente_selezionato,
        'emotion_chart_data': emotion_chart_data,
        'statistiche': statistiche,
        'note_diario': note_diario,
        'correlazione_contesto_data': correlazione_contesto_data,
    })

def riassunto_caso_clinico(request):
    """
    View per generare un riassunto del caso clinico di un paziente
    basato sulle note di un periodo selezionato.
    """
    if request.session.get('user_type') != 'medico':
        return redirect('/login/')

    medico_id = request.session.get('user_id')
    medico = get_object_or_404(Medico, codice_identificativo=medico_id)

    paziente_id = request.GET.get('paziente_id')
    periodo = request.GET.get('periodo', '7days')  # Default: ultimi 7 giorni

    if not paziente_id:
        messages.error(request, 'Seleziona un paziente.')
        return redirect('medico_home')

    paziente_selezionato = get_object_or_404(Paziente, codice_fiscale=paziente_id)

    # Verifica che il paziente sia del medico loggato
    if paziente_selezionato.med != medico:
        messages.error(request, 'Non hai i permessi per visualizzare questo paziente.')
        return redirect('medico_home')

    # Calcola la data di inizio in base al periodo selezionato
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

    # Recupera le note del periodo selezionato
    note_periodo = NotaDiario.objects.filter(
        paz=paziente_selezionato,
        data_nota__gte=data_inizio
    ).order_by('data_nota')

    riassunto = None
    data_generazione = None

    # Controlla se è stata richiesta una nuova generazione
    if request.method == 'POST' or request.GET.get('genera') == '1':
        if note_periodo.exists():
            # Costruisci il contesto per il riassunto
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

            prompt = f"""Sei uno psicologo clinico esperto. Il tuo compito è generare un riassunto clinico professionale dello stato del paziente basandoti sulle note del diario raccolte nel periodo specificato.

            INFORMAZIONI PAZIENTE:
            Nome: {paziente_selezionato.nome} {paziente_selezionato.cognome}
            Periodo analizzato: {periodo_label}
            Numero di note: {note_periodo.count()}
            
            NOTE DEL DIARIO:
            {contesto_note}
            
            ISTRUZIONI:
            1. Fornisci un riassunto clinico strutturato che includa:
               - Panoramica generale dello stato emotivo nel periodo
               - Pattern emotivi ricorrenti identificati
               - Eventuali miglioramenti o peggioramenti osservati
               - Aree di attenzione o preoccupazione
               - Raccomandazioni per il follow-up
            
            2. Usa un linguaggio professionale e clinico
            3. Sii obiettivo e basati solo sui dati forniti
            4. Evidenzia eventuali trend significativi
            
            Genera il riassunto clinico:"""

            riassunto = genera_con_ollama(prompt, max_chars=2000, temperature=0.5)
            data_generazione = timezone.now()

            # Salva o aggiorna il riassunto nel database
            riassunto_obj, created = RiassuntoCasoClinico.objects.update_or_create(
                paz=paziente_selezionato,
                med=medico,
                periodo=periodo,
                defaults={
                    'testo_riassunto': riassunto,
                    'data_generazione': data_generazione,
                }
            )
        else:
            riassunto = "Non sono presenti note nel periodo selezionato."
            data_generazione = timezone.now()
    else:
        # Cerca un riassunto esistente nel database
        riassunto_esistente = RiassuntoCasoClinico.objects.filter(
            paz=paziente_selezionato,
            med=medico,
            periodo=periodo
        ).first()

        if riassunto_esistente:
            riassunto = riassunto_esistente.testo_riassunto
            data_generazione = riassunto_esistente.data_generazione

    return render(request, 'SoulDiaryConnectApp/riassunto_caso_clinico.html', {
        'medico': medico,
        'paziente': paziente_selezionato,
        'periodo': periodo,
        'periodo_label': periodo_label,
        'note_periodo': note_periodo,
        'num_note': note_periodo.count(),
        'riassunto': riassunto,
        'data_generazione': data_generazione,
    })
