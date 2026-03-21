import logging
import requests
import re
from django.db import connection
from django.utils import timezone
from ...models import Paziente, NotaDiario

from .prompt import (
    get_prompt_analizza_sentiment,
    get_prompt_analizza_contesto_sociale,
    get_prompt_genera_frasi_di_supporto,
    get_prompt_non_strutturato_breve,
    get_prompt_non_strutturato_lungo,
    get_prompt_strutturato_breve,
    get_prompt_strutturato_lungo
)

from .constants import (
    OLLAMA_BASE_URL, 
    OLLAMA_MODEL, 
    LUNGHEZZA_NOTA_BREVE,
    LUNGHEZZA_NOTA_LUNGA,
    KEYWORDS_AUTOLESIONISMO,
    KEYWORDS_SUICIDIO,
    KEYWORDS_VIOLENZA_STALKING,
    MESSAGGI_CONFORTO,
    EMOZIONI_EMOJI,
    CONTESTI_EMOJI
)

logger = logging.getLogger(__name__)

##################################### --- AI --- ################################################
def genera_con_ollama(prompt, max_chars=None, temperature=0.7):
    """
    Helper function to call the Ollama API and normalize the response by removing
    any prefixes or introductory labels (e.g., "Answer:", "Your answer:").

    Args:
    prompt: The prompt to send to the model
    max_chars: Maximum number of characters for the response (optional)
    temperature: Temperature for generation (default 0.7)
    """
    try:
        estimated_tokens = (max_chars * 2) if max_chars else 500

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": estimated_tokens,
            }
        }

        response = requests.post(OLLAMA_BASE_URL, json=payload, timeout=500)

        if response.status_code != 200:
            logger.error(f"Ollama ha restituito status code {response.status_code}")
            logger.error(f"Risposta: {response.text}")
            return "Il servizio di generazione testo non è al momento disponibile. Riprova più tardi."

        response.raise_for_status()
        result = response.json()

        # Extract text from response robustly
        text = ''
        if isinstance(result, dict):
            for key in ('response', 'text', 'output', 'result'):
                if key in result and result[key]:
                    text = result[key]
                    break
        else:
            text = result

        # If the text is a list, join the elements
        if isinstance(text, list):
            text = " ".join(map(str, text))

        text = str(text or '').strip()

        # Removes common introductory prefixes (case-insensitive)
        text = re.sub(
            r'^\s*(?:La tua risposta[:\-\s]*|Risposta[:\-\s]*|Output[:\-\s]*|>\s*|Answer[:\-\s]*|Risposta del modello[:\-\s]*)+',
            '', 
            text, 
            flags=re.I
        )

        # Removes introductory phrases typical of clinical notes
        text = re.sub(
            r'^\s*(?:Ecco la (?:nota clinica|valutazione|analisi)[:\-\s]*|Di seguito[:\-\s]*|La valutazione è[:\-\s]*|Ecco l\'analisi[:\-\s]*|Nota clinica[:\-\s]*)+',
            '', 
            text, 
            flags=re.I
        )

        # Remove leading quotes, single quotes, bullets, or greater-than characters
        text = re.sub(r'^[\'"«\s\-\u2022>]+', '', text).strip()

        return text if text else "Generazione non disponibile al momento."

    except requests.exceptions.ConnectionError:
        logger.error("Impossibile connettersi a Ollama. Assicurati che il servizio sia in esecuzione.")
        return "Servizio di generazione testo non disponibile. Verifica che Ollama sia attivo."
    except requests.exceptions.Timeout:
        logger.error("Timeout nella chiamata a Ollama")
        return "Il tempo di attesa per la generazione è scaduto. Riprova."
    except requests.exceptions.RequestException as e:
        logger.error(f"Errore nella chiamata a Ollama: {e}")
        return "Errore durante la generazione del testo. Riprova più tardi."
    except Exception as e:
        logger.error(f"Errore imprevisto: {e}")
        return "Errore imprevisto durante la generazione. Riprova."


def genera_frasi_di_supporto(testo, paziente=None):
    """
    Generate patient empathy phrases using Ollama

    Args:
    text: The text of the patient's note
    patient: The Patient object (optional, to avoid confusion with other names in the text)
    """
    print("Generazione frasi supporto con Ollama")
    
    prompt = get_prompt_genera_frasi_di_supporto(paziente, testo)

    return genera_con_ollama(prompt, max_chars=500, temperature=0.3)


def analizza_sentiment(testo, paziente=None):
    """
    Analyzes the sentiment of the patient's text and returns the predominant emotion
    with its explanation.

    Args:
    text: The text of the patient's note
    patient: The Patient object (optional, to avoid confusion with other names in the text)

    Returns:
    tuple: (emotion, explanation)
    """

    emozioni_lista = ', '.join(EMOZIONI_EMOJI.keys())

    prompt = get_prompt_analizza_sentiment(paziente, emozioni_lista, testo)

    risposta = genera_con_ollama(prompt, max_chars=300, temperature=0.2)

    # # Response parsing - improves multi-line explanation capture
    linee = risposta.strip().split('\n')
    emozione = None
    spiegazione = None
    in_spiegazione = False
    spiegazione_parts = []

    for linea in linee:
        linea_stripped = linea.strip()
        if linea_stripped.lower().startswith('emozione:'):
            emozione = linea_stripped.split(':', 1)[1].strip().lower().rstrip('.!?,;:')
            in_spiegazione = False
        elif linea_stripped.lower().startswith('spiegazione:'):
            spiegazione_parts.append(linea_stripped.split(':', 1)[1].strip())
            in_spiegazione = True
        elif in_spiegazione and linea_stripped:
            spiegazione_parts.append(linea_stripped)

    if spiegazione_parts:
        spiegazione = ' '.join(spiegazione_parts)

    if emozione and emozione in EMOZIONI_EMOJI:
        emozione_validata = emozione
    else:
        # Fuzzy matching: check if the emotion is partially contained
        emozione_validata = None
        for chiave in EMOZIONI_EMOJI.keys():
            if emozione and chiave in emozione:
                emozione_validata = chiave
                break

        if not emozione_validata:
            sinonimi = {
                'contentezza': 'gioia',
                'allegria': 'gioia',
                'contento': 'gioia',
                'felice': 'felicità',
                'triste': 'tristezza',
                'arrabbiato': 'rabbia',
                'furioso': 'rabbia',
                'spaventato': 'paura',
                'impaurito': 'paura',
                'ansioso': 'ansia',
                'agitato': 'ansia',
                'nervoso': 'nervosismo',
                'stanco': 'stanchezza',
                'affaticato': 'stanchezza',
                'angoscia': 'ansia',
                'angosciato': 'ansia',
                'confuso': 'confusione',
                'nostalgico': 'nostalgia',
                'deluso': 'delusione',
                'solo': 'solitudine',
                'isolato': 'solitudine',
                'frustrato': 'frustrazione',
                'orgoglioso': 'orgoglio',
                'imbarazzato': 'imbarazzo',
                'inadeguato': 'inadeguatezza',
                'disperato': 'disperazione',
            }
            if emozione and emozione in sinonimi:
                emozione_validata = sinonimi[emozione]

        # If we really don't find anything, log the error and keep the model output
        if not emozione_validata:
            print(f"⚠️ ATTENZIONE: Emozione non valida ricevuta dal modello: '{emozione}'") 
            emozione_validata = emozione if emozione else None

    # Improve explanation fallback
    if not spiegazione or (spiegazione and len(spiegazione) < 10):
        if 'perché' in risposta.lower() or 'indica' in risposta.lower() or 'esprime' in risposta.lower():
            spiegazione = risposta.replace('\n', ' ').strip()
            if 'emozione:' in spiegazione.lower():
                parti = spiegazione.lower().split('spiegazione:')
                if len(parti) > 1:
                    spiegazione = parti[1].strip()
        else:
            if emozione_validata:
                spiegazione = f"Il testo esprime un vissuto emotivo riconducibile a {emozione_validata}."
            else:
                spiegazione = "Analisi emotiva del testo in corso."

    print(f"Emozione rilevata: {emozione_validata}, Spiegazione: {spiegazione}")
    return emozione_validata, spiegazione


def analizza_contesto_sociale(testo, paziente=None):
    """
    Analyzes the social context of the patient's text and returns the main context
    with its explanation.

    Args:
    text: The text of the patient's note
    patient: The Patient object (optional, to avoid confusion with other names in the text)

    Returns:
    tuple: (context, explanation)
    """

    print("Analisi contesto sociale con Ollama")

    contesti_lista = ', '.join(CONTESTI_EMOJI.keys())

    prompt = get_prompt_analizza_contesto_sociale(paziente, testo, contesti_lista)

    risposta = genera_con_ollama(prompt, max_chars=400, temperature=0.2)

    print(f"Risposta contesto sociale raw: {risposta}")

    linee = risposta.strip().split('\n')
    contesto = None
    spiegazione = None

    for linea in linee:
        linea_stripped = linea.strip()
        if linea_stripped.lower().startswith('contesto:'):
            contesto = linea_stripped.split(':', 1)[1].strip().lower().rstrip('.!?,;:')
        elif linea_stripped.lower().startswith('spiegazione:'):
            spiegazione = linea_stripped.split(':', 1)[1].strip()

    print(f"Contesto parsed: {contesto}, Spiegazione parsed: {spiegazione}")

    if contesto and contesto in CONTESTI_EMOJI:
        contesto_validato = contesto
    else:
        contesto_validato = 'altro'
        for chiave in CONTESTI_EMOJI.keys():
            if contesto and chiave in contesto:
                contesto_validato = chiave
                break

        sinonimi = {
            'ufficio': 'lavoro',
            'azienda': 'lavoro',
            'professione': 'lavoro',
            'carriera': 'lavoro',
            'college': 'università',
            'ateneo': 'università',
            'liceo': 'scuola',
            'elementare': 'scuola',
            'media': 'scuola',
            'genitori': 'famiglia',
            'fratelli': 'famiglia',
            'parenti': 'famiglia',
            'figli': 'famiglia',
            'madre': 'famiglia',
            'padre': 'famiglia',
            'mamma': 'famiglia',
            'papà': 'famiglia',
            'sorella': 'famiglia',
            'fratello': 'famiglia',
            'amici': 'amicizia',
            'compagni': 'amicizia',
            'amico': 'amicizia',
            'amica': 'amicizia',
            'partner': 'relazione',
            'fidanzato': 'relazione',
            'fidanzata': 'relazione',
            'marito': 'relazione',
            'moglie': 'relazione',
            'compagno': 'relazione',
            'compagna': 'relazione',
            'ragazzo': 'relazione',
            'ragazza': 'relazione',
            'sentimentale': 'relazione',
            'romantico': 'relazione',
            'romantica': 'relazione',
            'coppia': 'relazione',
            'amore': 'relazione',
            'innamorato': 'relazione',
            'innamorata': 'relazione',
            'medico': 'salute',
            'ospedale': 'salute',
            'malattia': 'salute',
            'allenamento': 'palestra',
            'allenarsi': 'palestra',
            'corsa': 'sport',
            'correre': 'sport',
            'nuoto': 'sport',
            'nuotare': 'sport',
            'calcio': 'sport',
            'tennis': 'sport',
            'basket': 'sport',
            'pallavolo': 'sport',
            'ciclismo': 'sport',
            'bicicletta': 'sport',
            'fitness': 'palestra',
            'pesi': 'palestra',
            'cardio': 'palestra',
            'crossfit': 'palestra',
            'yoga': 'palestra',
            'pilates': 'palestra',
            'esercizi': 'palestra',
            'esercizio': 'palestra',
            'attività fisica': 'sport',
            'ginnastica': 'palestra',
            'svago': 'tempo libero',
            'divertimento': 'tempo libero',
            'passatempo': 'hobby',
            'vacanza': 'viaggi',
            'viaggio': 'viaggi',
            'appartamento': 'casa',
            'soldi': 'finanze',
            'economia': 'finanze',
            'meditazione': 'spiritualità',
            'religione': 'spiritualità',
            'esame': 'studio',
            'compiti': 'studio',
            'cibo': 'alimentazione',
            'dieta': 'alimentazione',
            'dormire': 'sonno',
            'insonnia': 'sonno',
        }

        if contesto and contesto in sinonimi:
            contesto_validato = sinonimi[contesto]

    if not spiegazione:
        spiegazione = "Contesto rilevato in base al contenuto generale del testo."

    print(f"Contesto rilevato: {contesto_validato}, Spiegazione: {spiegazione}")
    return contesto_validato, spiegazione


def _recupera_contesto_note_precedenti(paziente, limite=5, escludi_nota_id=None):
    """
    Retrieves the patient's latest notes to provide context, excluding the current note.

    Args:
    patient: Patient Object
    limit: Maximum number of notes to retrieve (default 5)
    exclude_note_id: ID of the note to exclude (typically the current note) (optional)

    Returns:
    String with a summary of previous notes
    """
    
    # Filtra le note del paziente
    query = NotaDiario.objects.filter(paz=paziente)

    # Escludi la nota corrente se specificata e filtra solo note PRECEDENTI
    if escludi_nota_id is not None:
        try:
            nota_corrente = NotaDiario.objects.get(id=escludi_nota_id)
            # Filtra solo le note con data PRECEDENTE alla nota corrente
            query = query.filter(data_nota__lt=nota_corrente.data_nota)
        except NotaDiario.DoesNotExist:
            query = query.exclude(id=escludi_nota_id)

    # Prendi le ultime 'limite' note (le più recenti tra quelle precedenti)
    note_precedenti = query.order_by('-data_nota')[:limite]

    if not note_precedenti.exists():
        return "Nessuna nota precedente disponibile."

    contesto = []
    for i, nota in enumerate(reversed(list(note_precedenti)), 1):
        # Converti al timezone locale per la formattazione
        data_locale = timezone.localtime(nota.data_nota)
        data_ora_formattata = data_locale.strftime('%d/%m/%Y alle %H:%M')
        emozione = nota.emozione_predominante or "non specificata"
        testo_breve = nota.testo_paziente[:150] + "..." if len(nota.testo_paziente) > 150 else nota.testo_paziente
        contesto.append(f"[{data_ora_formattata}] - Emozione: {emozione}\nTesto: {testo_breve}")

    return "\n\n".join(contesto)


def _genera_prompt_non_strutturato_breve(testo, max_chars, contesto_precedente, paziente=None):
    """Prompt per nota non strutturata breve"""
    return get_prompt_non_strutturato_breve(paziente, contesto_precedente, testo, max_chars)


def _genera_prompt_non_strutturato_lungo(testo, max_chars, contesto_precedente, paziente=None):
    """Prompt per nota non strutturata lunga"""
    return get_prompt_non_strutturato_lungo(paziente, contesto_precedente, testo, max_chars)


def _genera_prompt_strutturato_breve(testo, parametri_strutturati, tipo_parametri, max_chars, contesto_precedente, paziente=None):
    """Prompt per nota strutturata breve"""
    return  get_prompt_strutturato_breve(paziente, contesto_precedente, testo, max_chars, parametri_strutturati, tipo_parametri)


def _genera_prompt_strutturato_lungo(testo, parametri_strutturati, tipo_parametri, max_chars, contesto_precedente, paziente=None):
    """Prompt per nota strutturata lunga"""
    return get_prompt_strutturato_lungo(paziente, contesto_precedente, testo, max_chars, parametri_strutturati, tipo_parametri)


def genera_frasi_cliniche(testo, medico, paziente, nota_id=None):
    """
    Generates personalized clinical notes based on the physician's preferences.
    Includes the context of the patient's last 5 notes (excluding the current one) for a more comprehensive evaluation.

    Args:
    text: Patient note text
    doctor: Physician Subject
    patient: Patient Subject
    note_id: ID of the current note to exclude from the context (optional)

    Handles 4 combinations:
    - Structured + Short
    - Structured + Long
    - Unstructured + Short
    - Unstructured + Long
    """

    print("Generazione commenti clinici con Ollama")

    try:
        tipo_nota = medico.tipo_nota  # True per "strutturato", False per "non strutturato"
        lunghezza_nota = medico.lunghezza_nota  # True per "lungo", False per "breve"
        tipo_parametri = medico.tipo_parametri.split(".:;!") if medico.tipo_parametri else []
        testo_parametri = medico.testo_parametri.split(".:;!") if medico.testo_parametri else []
        print("GENERA FRASI CLINICHE")
        print(f"\nTipo Nota: {tipo_nota}")
        print(f"\nLunghezza nota: {lunghezza_nota}")
        print(f"\nTipo parametri: {tipo_parametri}")
        print(f"\nTesto parametri: {testo_parametri}")

        # Determina la lunghezza massima in caratteri
        max_chars = LUNGHEZZA_NOTA_LUNGA if lunghezza_nota else LUNGHEZZA_NOTA_BREVE
        print(f"\nMax chars: {max_chars}")

        # Recupera il contesto delle note precedenti (esclusa quella corrente)
        contesto_precedente = _recupera_contesto_note_precedenti(paziente, limite=5, escludi_nota_id=nota_id)
        print(f"\nContesto prec: {contesto_precedente}")

        if tipo_nota:
            # Nota strutturata
            parametri_strutturati = "\n".join(
                [f"{tipo}: {txt}" for tipo, txt in zip(tipo_parametri, testo_parametri)]
            )
            if lunghezza_nota:
                # Strutturata + Lunga
                prompt = _genera_prompt_strutturato_lungo(testo, parametri_strutturati, tipo_parametri, max_chars, contesto_precedente, paziente)
            else:
                # Strutturata + Breve
                prompt = _genera_prompt_strutturato_breve(testo, parametri_strutturati, tipo_parametri, max_chars, contesto_precedente, paziente)
        else:
            # Nota non strutturata
            if lunghezza_nota:
                # Non Strutturata + Lunga
                prompt = _genera_prompt_non_strutturato_lungo(testo, max_chars, contesto_precedente, paziente)
            else:
                # Non Strutturata + Breve
                prompt = _genera_prompt_non_strutturato_breve(testo, max_chars, contesto_precedente, paziente)

        print(f"\nPrompt:\n{prompt }")
        return genera_con_ollama(prompt, max_chars=max_chars, temperature=0.6)

    except Exception as e:
        logger.error(f"Errore nella generazione clinica: {e}")
        return f"Errore durante la generazione: {e}"


def genera_analisi_in_background(nota_id, testo_paziente, medico, paziente):
    """
    A function that runs in a separate thread to generate
    clinical analysis, sentiment, and social context in the background.
    """
    try:
        # Generate analyses (pass note_id to exclude the current note from the context)
        testo_clinico = genera_frasi_cliniche(testo_paziente, medico, paziente, nota_id=nota_id)
        emozione_predominante, spiegazione_emozione = analizza_sentiment(testo_paziente, paziente)
        contesto_sociale, spiegazione_contesto = analizza_contesto_sociale(testo_paziente, paziente)

        # Update the note in the database
        nota = NotaDiario.objects.get(id=nota_id)
        nota.testo_clinico = testo_clinico
        nota.emozione_predominante = emozione_predominante
        nota.spiegazione_emozione = spiegazione_emozione
        nota.contesto_sociale = contesto_sociale
        nota.spiegazione_contesto = spiegazione_contesto
        nota.generazione_in_corso = False
        nota.save()

        logger.info(f"Generazione in background completata per nota {nota_id}")
    except Exception as e:
        logger.error(f"Errore nella generazione in background per nota {nota_id}: {e}")
        # Set generation_in_progress to False anyway to avoid crashes
        try:
            nota = NotaDiario.objects.get(id=nota_id)
            nota.generazione_in_corso = False
            nota.testo_clinico = "Errore durante la generazione dell'analisi clinica."
            nota.save()
        except:
            pass
    finally:
        connection.close()


##################################### --- NO AI --- ################################################
def rileva_contenuto_crisi(testo):
    """
    Analyzes text for risk/crisis content.

    Args:
    text: The text of the patient's note

    Returns:
    tuple: (is_emergency, emergency_type)
    is_emergency: True if risk content is detected
    emergency_type: 'suicide', 'violence', 'self-harm', or 'none'
    """
    if not testo:
        return False, 'none'

    testo_lower = testo.lower()

    for keyword in KEYWORDS_SUICIDIO:
        if keyword in testo_lower:
            logger.warning(f"EMERGENZA RILEVATA - Tipo: suicidio - Keyword: {keyword}")
            return True, 'suicidio'

    for keyword in KEYWORDS_VIOLENZA_STALKING:
        if keyword in testo_lower:
            logger.warning(f"EMERGENZA RILEVATA - Tipo: violenza - Keyword: {keyword}")
            return True, 'violenza'

    for keyword in KEYWORDS_AUTOLESIONISMO:
        if keyword in testo_lower:
            logger.warning(f"EMERGENZA RILEVATA - Tipo: autolesionismo - Keyword: {keyword}")
            return True, 'autolesionismo'

    return False, 'none'


def genera_messaggio_emergenza(tipo_emergenza, medico):
    """
    Generates the custom emergency message with the doctor's contact information.

    Args:
    emergency_type: The type of emergency detected
    doctor: The patient's doctor object

    Returns:
    str: The formatted emergency message
    """
    if tipo_emergenza not in MESSAGGI_CONFORTO:
        return None

    nome_medico = f"Dr. {medico.nome} {medico.cognome}" if medico else "il tuo medico"

    if medico and medico.numero_telefono_cellulare:
        telefono_medico = medico.numero_telefono_cellulare
    elif medico and medico.numero_telefono_studio:
        telefono_medico = medico.numero_telefono_studio
    else:
        telefono_medico = "(contattalo via email)"

    messaggio = MESSAGGI_CONFORTO[tipo_emergenza].format(
        nome_medico=nome_medico,
        telefono_medico=telefono_medico
    )
    return messaggio