def get_prompt_analizza_sentiment(paziente, emozioni_lista, testo):
    info_paziente = ""
    
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        info_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
        L'autore di questo testo è {nome_completo}.
        Questo testo è scritto in prima persona da {nome_completo}.
        Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON all'autore.
        Analizza le emozioni di {nome_completo}, l'autore del testo.
        """

    prompt = f"""Sei un esperto di analisi delle emozioni. Il tuo compito è identificare l'emozione predominante in un testo e spiegare perché.

    {info_paziente}
    
    EMOZIONI DISPONIBILI (scegli SOLO tra queste):
    {emozioni_lista}
    
    FORMATO RISPOSTA (OBBLIGATORIO):
    Emozione: [una sola parola dalla lista]
    Spiegazione: [breve spiegazione di 1-2 frasi che cita elementi specifici del testo]
    
    REGOLE FONDAMENTALI:
    1. La prima riga DEVE iniziare con "Emozione:" seguita da UNA SOLA PAROLA dalla lista
    2. La seconda riga DEVE iniziare con "Spiegazione:" seguita dalla motivazione
    3. Nella spiegazione, DEVI citare parole o frasi SPECIFICHE del testo originale tra virgolette
    4. La spiegazione deve essere breve (max 2 frasi)
    5. NON inventare emozioni non presenti nella lista
    6. USA "confusione" SOLO se il testo esprime esplicitamente incertezza, dubbi o disorientamento
    7. La spiegazione DEVE SEMPRE contenere citazioni dirette dal testo
    
    ATTENZIONE SU "CONFUSIONE":
    - "confusione" significa disorientamento mentale, non sapere cosa fare o pensare
    - NON usare "confusione" come emozione di default quando non sai cosa scegliere
    - Se il testo esprime più emozioni, scegli quella PREDOMINANTE (la più forte/evidente)
    - Se il testo è neutro o descrittivo, cerca comunque il tono emotivo sottostante
    
    ESEMPI CORRETTI:
    Testo: "Oggi sono riuscito a superare l'esame, sono contentissimo e felice!"
    Emozione: felicità
    Spiegazione: Il testo esprime felicità attraverso le parole "contentissimo" e "felice", associate al successo nell'esame.
    
    Testo: "Mi sento solo e nessuno mi capisce, è terribile"
    Emozione: solitudine
    Spiegazione: L'espressione "mi sento solo" e "nessuno mi capisce" indica un vissuto di isolamento emotivo.
    
    Testo: "Non ce la faccio più, tutto va storto e sono stufo"
    Emozione: frustrazione
    Spiegazione: Le frasi "non ce la faccio più" e "tutto va storto" indicano un senso di impotenza e irritazione.
    
    Testo: "Non so cosa fare, sono indeciso se accettare o rifiutare"
    Emozione: confusione
    Spiegazione: Le espressioni "non so cosa fare" e "sono indeciso" indicano uno stato di incertezza e disorientamento decisionale.
    
    Testo da analizzare:
    {testo}
    
    Rispondi ora nel formato richiesto (ricorda: la spiegazione DEVE citare parole specifiche del testo):"""

    return prompt


def get_prompt_analizza_contesto_sociale(paziente, testo, contesti_lista):
    info_paziente = ""
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        info_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
        L'autore di questo testo è {nome_completo}.
        Questo testo è scritto in prima persona da {nome_completo}.
        Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON all'autore.
        Identifica il contesto sociale in cui si trova {nome_completo}, l'autore del testo.
        """

    prompt = f"""Sei un esperto di analisi del contesto sociale. Il tuo compito è identificare il contesto sociale principale in cui si svolge il racconto di un paziente e spiegare perché.

    {info_paziente}
    
    CONTESTI DISPONIBILI (scegli SOLO tra questi):
    {contesti_lista}
    
    FORMATO RISPOSTA (OBBLIGATORIO):
    Contesto: [una sola parola o due parole dalla lista]
    Spiegazione: [breve spiegazione di 1-2 frasi che cita elementi specifici del testo]
    
    REGOLE FONDAMENTALI:
    1. La prima riga DEVE iniziare con "Contesto:" seguita da UNA o DUE PAROLE dalla lista
    2. La seconda riga DEVE iniziare con "Spiegazione:" seguita dalla motivazione
    3. Nella spiegazione, cita parole o frasi SPECIFICHE del testo originale
    4. La spiegazione deve essere breve (max 2 frasi)
    5. NON inventare contesti non presenti nella lista
    6. Se il testo non indica chiaramente un contesto, usa "altro"
    
    REGOLE SPECIFICHE IMPORTANTI:
    - L'attività fisica (palestra, allenamento, corsa, nuoto, calcio, fitness, yoga, esercizi, pesi, cardio, crossfit, ecc.) va SEMPRE classificata come "palestra" o "sport", MAI come "tempo libero"
    - "tempo libero" si usa solo per attività ricreative NON sportive come: videogiochi, TV, cinema, lettura, uscite con amici per svago, shopping, ecc.
    
    COME DISTINGUERE I CONTESTI RELAZIONALI (MOLTO IMPORTANTE):
    - "famiglia": usa SOLO se il testo menziona ESPLICITAMENTE familiari (madre, padre, fratello, sorella, figlio, figlia, marito, moglie, nonno, nonna, zio, zia, cugino, ecc.)
    - "relazione": usa quando il testo parla di partner sentimentale/romantico (fidanzato/a, compagno/a, relazione amorosa, baci, intimità, sentimenti romantici, paura di investire in una relazione, gelosia sentimentale)
    - "amicizia": usa per amici, compagni, conoscenti (senza connotazione romantica)
    - Se una persona viene descritta con dinamiche romantiche/sentimentali (es. "investire su qualcuno", "gelosia", "amore", gesti affettuosi romantici) = "relazione"
    - NON assumere che qualcuno sia un familiare solo perché è una persona cara
    
    ESEMPI CORRETTI:
    Testo: "Oggi al lavoro il mio capo mi ha criticato davanti a tutti i colleghi"
    Contesto: lavoro
    Spiegazione: Il testo si svolge chiaramente in ambito lavorativo, con riferimenti espliciti al "lavoro", al "capo" e ai "colleghi".
    
    Testo: "Ho litigato con mia madre perché non capisce le mie scelte"
    Contesto: famiglia
    Spiegazione: Il testo descrive una dinamica familiare, con riferimento esplicito a "mia madre" e a un conflitto intergenerazionale.
    
    Testo: "Ho passato la serata con Marco e abbiamo giocato alla PlayStation"
    Contesto: amicizia
    Spiegazione: Il testo descrive un momento di svago con un amico, senza connotazioni romantiche o familiari.
    
    Testo: "Ieri sera io e Laura ci siamo baciati per la prima volta, il mio cuore batteva fortissimo"
    Contesto: relazione
    Spiegazione: Il testo descrive chiaramente un momento romantico e sentimentale con "bacio" e riferimenti a sentimenti d'amore.
    
    Testo: "Sono andato in palestra e mi sono allenato duramente"
    Contesto: palestra
    Spiegazione: Il testo menziona esplicitamente la "palestra" e l'allenamento fisico.
    
    Testo: "Oggi ho fatto una bella corsa al parco e poi esercizi a casa"
    Contesto: sport
    Spiegazione: Il testo descrive attività fisica come "corsa" ed "esercizi", che rientrano nel contesto sportivo.
    
    Testo da analizzare:
    {testo}
    
    Rispondi ora nel formato richiesto:"""

    return prompt


def get_prompt_genera_frasi_di_supporto(paziente, testo):
    contesto_paziente = ""
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        contesto_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
        L'autore di questo testo è {nome_completo}.
        Questo testo è scritto in prima persona da {nome_completo}.
        Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON all'autore.
        Quando rispondi, rivolgiti direttamente a {paziente.nome} (o usa "tu" senza nominarlo).
        """

    prompt = f"""Sei un assistente empatico e di supporto emotivo. Il tuo compito è rispondere con calore e comprensione a persone che stanno attraversando momenti difficili.

    {contesto_paziente}
    
    Esempio:
    Testo del paziente: "Ho fallito il mio esame e ho voglia di arrendermi."
    Risposta di supporto: "Mi dispiace molto per il tuo esame. È normale sentirsi delusi, ma questo non definisce il tuo valore come persona. Potresti provare a rivedere il tuo metodo di studio e chiedere aiuto se ne hai bisogno. Ce la puoi fare!"
    
    ISTRUZIONI:
    - Rispondi in italiano con tono caldo, empatico e incoraggiante
    - Riconosci e valida le emozioni espresse
    - Offri una prospettiva positiva senza minimizzare i sentimenti
    - Suggerisci delicatamente possibili strategie o riflessioni utili
    - Non usare un tono clinico o distaccato
    - Completa sempre la risposta, non troncare mai a metà
    - NON confondere l'autore del testo con altre persone menzionate nella nota
    
    Testo del paziente:
    {testo}
    
    Rispondi con una frase di supporto:"""

    return prompt


def get_prompt_non_strutturato_breve(paziente, contesto_precedente, testo, max_chars):
    info_paziente = ""
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        info_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
            L'autore di questo testo è {nome_completo}.
            Questo testo è scritto in prima persona da {nome_completo}.
            Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON al paziente.
            """

    # Sezione contesto note precedenti (solo se esistono)
    ha_note_precedenti = contesto_precedente != "Nessuna nota precedente disponibile."
    sezione_contesto = ""
    regole_note_precedenti = ""

    if ha_note_precedenti:
        sezione_contesto = f"""CONTESTO - Note precedenti del paziente (SOLO per riferimento, NON descrivere ogni nota):
            {contesto_precedente}
            """
        regole_note_precedenti = """
            2. Le note precedenti sono SOLO contesto (10%) - menzionale brevemente se utile
            3. Usa espressioni generiche come "rispetto alle note precedenti", "diversamente da prima"
            4. Se menzioni una nota specifica, USA SOLO la data e l'orario (es: "rispetto al 15/12/2025 alle 14:30")
            5. VIETATO ASSOLUTO: MAI scrivere "Nota 1", "Nota 2", "(Nota 3)" o simili - il medico non sa cosa significano
            6. NON dedicare frasi intere a riassumere le note precedenti"""
    else:
        regole_note_precedenti = """
            2. Questa è la PRIMA nota del paziente - NON fare riferimenti a note precedenti inesistenti"""
    
    prompt = f"""Sei un assistente di uno psicoterapeuta specializzato. Analizza il seguente testo e fornisci una valutazione clinica discorsiva BREVE.

    {info_paziente}
    
    {sezione_contesto}

    ISTRUZIONI FONDAMENTALI:
    - La risposta deve essere BREVE e SINTETICA (massimo {max_chars} caratteri)
    - Scrivi in modo discorsivo, come un commento clinico professionale
    - NON usare elenchi, grassetti, markdown, simboli o titoli
    
    REGOLE PER L'ANALISI:
    1. CONCENTRATI AL 90% SULLA NOTA CORRENTE - analizza principalmente il testo attuale {regole_note_precedenti}
    
    COSA FARE:
    ✓ Analizzare il contenuto emotivo e psicologico della NOTA CORRENTE
    ✓ Identificare i vissuti emotivi emergenti OGGI
    ✓ Notare eventuali cambiamenti generali rispetto al passato
    ✓ Scrivere in modo fluido e professionale
    
    COSA NON FARE:
    ✗ NON usare frasi introduttive come "Ecco la nota clinica", "La valutazione è"
    
    Inizia DIRETTAMENTE con l'analisi del contenuto emotivo/psicologico. Completa sempre la frase.
    
    Testo da analizzare (QUESTO È IL FOCUS):
    {testo}"""
    return prompt


def get_prompt_non_strutturato_lungo(paziente, contesto_precedente, testo, max_chars):
    info_paziente = ""
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        info_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
            L'autore di questo testo è {nome_completo}.
            Questo testo è scritto in prima persona da {nome_completo}.
            Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON al paziente.
            """

    # Sezione contesto note precedenti (solo se esistono)
    ha_note_precedenti = contesto_precedente != "Nessuna nota precedente disponibile."
    sezione_contesto = ""
    regole_note_precedenti = ""

    if ha_note_precedenti:
        sezione_contesto = f"""CONTESTO - Note precedenti del paziente (SOLO per riferimento, NON descrivere ogni nota):
            {contesto_precedente}
            """
        regole_note_precedenti = """
            2. Le note precedenti sono SOLO contesto di supporto (20%) - NON descriverle una per una
            3. Puoi fare riferimenti come 'Si osserva un evoluzione rispetto al pattern precedente', 'Diversamente dalle situazioni passate'
            4. Se menzioni una nota specifica, USA SOLO la data e l'orario (es: 'come emerso il 15/12/2025 alle 14:30')
            5. VIETATO ASSOLUTO: MAI scrivere 'Nota 1', 'Nota 2', '(Nota 3)' o simili - il medico non sa cosa significano
            6. NON dedicare paragrafi interi a riassumere le note precedenti
            7. Puoi usare espressioni generiche come 'nelle note precedenti', 'in passato', 'rispetto a situazioni simili'"""
    else:
        regole_note_precedenti = """
            2. Questa è la PRIMA nota del paziente - NON fare riferimenti a note precedenti inesistenti"""

    prompt = f"""Sei un assistente di uno psicoterapeuta specializzato. Analizza il seguente testo e fornisci una valutazione clinica discorsiva DETTAGLIATA e APPROFONDITA.

    {info_paziente}

    {sezione_contesto}

    ISTRUZIONI FONDAMENTALI:
    - La risposta deve essere DETTAGLIATA e COMPLETA (massimo {max_chars} caratteri)
    - Scrivi in modo discorsivo e professionale, come una nota clinica narrativa
    - Approfondisci gli aspetti emotivi, cognitivi e comportamentali
    - NON usare elenchi, grassetti, markdown, simboli o titoli
    
    REGOLE PER L'ANALISI:
    1. CONCENTRATI AL 80% SULLA NOTA CORRENTE - analizza in profondità il testo attuale {regole_note_precedenti}
    
    COSA FARE:
    ✓ Analizzare in profondità il contenuto emotivo della NOTA CORRENTE
    ✓ Esplorare i meccanismi cognitivi e i pattern comportamentali visibili OGGI
    ✓ Identificare i vissuti emotivi, le difese psicologiche, gli schemi ricorrenti nella situazione ATTUALE
    ✓ Contestualizzare in modo generico rispetto all'evoluzione del paziente
    ✓ Scrivere in modo fluido, professionale e clinicamente accurato
    
    COSA NON FARE:
    ✗ NON usare frasi introduttive come "Ecco la nota clinica", "La valutazione è"
    
    Inizia DIRETTAMENTE con l'analisi del contenuto emotivo/psicologico ATTUALE. Completa sempre la frase.
    
    Testo da analizzare in profondità (QUESTO È IL FOCUS PRINCIPALE):
    {testo}"""
    return prompt


def get_prompt_strutturato_breve(paziente, contesto_precedente, testo, max_chars, parametri_strutturati, tipo_parametri):
    info_paziente = ""
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        info_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
        L'autore di questo testo è {nome_completo}.
        Questo testo è scritto in prima persona da {nome_completo}.
        Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON al paziente.
        
        """

    # Sezione contesto note precedenti (solo se esistono)
    ha_note_precedenti = contesto_precedente != "Nessuna nota precedente disponibile."
    sezione_contesto = ""
    regole_note_precedenti = ""

    if ha_note_precedenti:
        sezione_contesto = f"""CONTESTO - Note precedenti del paziente (SOLO per riferimento, NON descrivere ogni nota):
            {contesto_precedente}
            """
        regole_note_precedenti = """
            2. Le note precedenti sono SOLO contesto di supporto (10%) - NON descriverle una per una
            3. Puoi fare riferimenti generici tipo "rispetto alle note precedenti", "in continuità con pattern emersi in precedenza"
            4. Se menzioni una nota specifica, USA SOLO la data e l'orario (es: "come emerso il 15/12/2025 alle 14:30")
            5. VIETATO ASSOLUTO: MAI scrivere "Nota 1", "Nota 2", "Nota 3", "(Nota 2)" o simili - il medico non sa cosa significano
            6. NON elencare o riassumere ogni singola nota precedente"""
    else:
        regole_note_precedenti = """
            2. Questa è la PRIMA nota del paziente - NON fare riferimenti a note precedenti inesistenti"""
    
    prompt = f"""Sei un assistente per uno psicoterapeuta. Analizza il seguente testo e fornisci una valutazione clinica strutturata e CONCISA.

    {info_paziente}

    {sezione_contesto}


    Esempio:
    Testo: "Oggi ho fallito il mio esame e ho voglia di arrendermi."
    Risposta:
    {parametri_strutturati}
    
    Parametri da utilizzare:
    {tipo_parametri}
    
    ISTRUZIONI FONDAMENTALI:
    - La risposta deve essere BREVE e SINTETICA (massimo {max_chars} caratteri)
    - FORMATO OBBLIGATORIO: ogni parametro deve essere su una NUOVA RIGA nel formato "NomeParametro: valore"
    - Vai a capo dopo ogni parametro
    
    REGOLE PER L'ANALISI:
    1. CONCENTRATI AL 90% SULLA NOTA CORRENTE - analizza principalmente il testo attuale {regole_note_precedenti}
    
    COSA FARE:
    ✓ Analizzare gli aspetti emotivi, cognitivi e comportamentali della NOTA CORRENTE
    ✓ Notare eventuali cambiamenti o pattern rispetto al passato (in modo generico)
    ✓ Focalizzarsi su ciò che emerge OGGI nel testo
    
    COSA NON FARE:
    ✗ NON usare markdown, elenchi puntati o simboli
    ✗ NON usare frasi introduttive come "Ecco la nota clinica", "Ecco l'analisi"
    
    Completa sempre la frase, non troncare mai a metà. Inizia DIRETTAMENTE con il primo parametro.
    
    Ora analizza questo testo (FOCALIZZATI SU QUESTO):
    {testo}"""
    return prompt


def get_prompt_strutturato_lungo(paziente, contesto_precedente, testo, max_chars, parametri_strutturati, tipo_parametri):
    info_paziente = ""
    if paziente:
        nome_completo = f"{paziente.nome} {paziente.cognome}"
        info_paziente = f"""INFORMAZIONE IMPORTANTE SULL'AUTORE:
            L'autore di questo testo è {nome_completo}.
            Questo testo è scritto in prima persona da {nome_completo}.
            Qualsiasi altro nome menzionato (anche se uguale a "{paziente.nome}") si riferisce ad altre persone (amici, familiari, colleghi, ecc.), NON al paziente.
            
            """

    # Sezione contesto note precedenti (solo se esistono)
    ha_note_precedenti = contesto_precedente != "Nessuna nota precedente disponibile."
    sezione_contesto = ""
    regole_note_precedenti = ""

    if ha_note_precedenti:
        sezione_contesto = f"""CONTESTO - Note precedenti del paziente (SOLO per riferimento, NON descrivere ogni nota):
            {contesto_precedente}
            """
        regole_note_precedenti = """
            2. Le note precedenti sono SOLO contesto di supporto (20%) - NON descriverle una per una
            3. Puoi fare riferimenti come 'Si nota un miglioramento rispetto al pattern ansioso emerso nelle settimane precedenti'
            4. Se menzioni una nota specifica, USA SOLO la data e l'orario (es: 'diversamente da quanto emerso il 15/12/2025 alle 14:30')
            5. VIETATO ASSOLUTO: MAI scrivere 'Nota 1', 'Nota 2', 'Nota 3', '(Nota 2)' o simili - il medico non sa cosa significano
            6. NON elencare o riassumere ogni singola nota precedente
            7. Puoi usare espressioni generiche come 'nelle note precedenti', 'in passato', 'rispetto a situazioni simili'"""
    else:
        regole_note_precedenti = """
            2. Questa è la PRIMA nota del paziente - NON fare riferimenti a note precedenti inesistenti"""
    
    prompt = f"""Sei un assistente per uno psicoterapeuta. Analizza il seguente testo e fornisci una valutazione clinica strutturata e DETTAGLIATA.

    {info_paziente}

    {sezione_contesto}
    
    Esempio:
    Testo: "Oggi ho fallito il mio esame e ho voglia di arrendermi."
    Risposta:
    {parametri_strutturati}
    
    Parametri da utilizzare:
    {tipo_parametri}
    
    ISTRUZIONI FONDAMENTALI:
    - La risposta deve essere DETTAGLIATA e APPROFONDITA (massimo {max_chars} caratteri)
    - FORMATO OBBLIGATORIO: ogni parametro deve essere su una NUOVA RIGA nel formato "NomeParametro: valore"
    - Vai a capo dopo ogni parametro
    - Fornisci analisi complete per ogni parametro
    
    REGOLE PER L'ANALISI:
    1. CONCENTRATI AL 80% SULLA NOTA CORRENTE - analizza principalmente il testo attuale in profondità {regole_note_precedenti}
    
    COSA FARE:
    ✓ Analizzare in profondità la NOTA CORRENTE: emozioni, pensieri, comportamenti
    ✓ Identificare schemi cognitivi e pattern comportamentali visibili OGGI
    ✓ Notare progressi o regressioni rispetto al contesto generale passato
    ✓ Fornire osservazioni cliniche dettagliate sulla situazione ATTUALE
    
    COSA NON FARE:
    ✗ NON usare markdown, elenchi puntati o simboli
    ✗ NON usare frasi introduttive come "Ecco la nota clinica"
    
    Completa sempre la frase, non troncare mai a metà. Inizia DIRETTAMENTE con il primo parametro.
    
    Ora analizza questo testo in profondità (QUESTO È IL FOCUS PRINCIPALE):
    {testo}"""
    return prompt


def get_summary_prompt(paziente, periodo_label, note_periodo, contesto_note):
    prompt = f"""Sei uno psicologo clinico esperto. Il tuo compito è generare un riassunto clinico professionale dello stato del paziente basandoti sulle note del diario raccolte nel periodo specificato.

        INFORMAZIONI PAZIENTE:
        Nome: {paziente.nome} {paziente.cognome}
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
    return prompt
