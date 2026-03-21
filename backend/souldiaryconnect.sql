DROP DATABASE IF EXISTS souldiaryconnect;
CREATE DATABASE souldiaryconnect;
\c souldiaryconnect;

-- Elimina le tabelle se esistono già (CASCADE forza l'eliminazione anche se ci sono dipendenze)
DROP TABLE IF EXISTS medico CASCADE;
DROP TABLE IF EXISTS paziente CASCADE;
DROP TABLE IF EXISTS nota_diario CASCADE;
DROP TABLE IF EXISTS messaggio CASCADE;
DROP TABLE IF EXISTS riassunto_caso_clinico CASCADE;

-- 1. Creazione tabella Medico
CREATE TABLE medico (
    codice_identificativo varchar(12) PRIMARY KEY,
    nome varchar(30) NOT NULL,
    cognome varchar(30) NOT NULL,
    indirizzo_studio varchar(30) NOT NULL,
    citta varchar(30) NOT NULL,
    numero_civico varchar(6) NOT NULL,
    numero_telefono_studio varchar(13) UNIQUE,
    numero_telefono_cellulare varchar(13) UNIQUE,
    email varchar(254) UNIQUE NOT NULL,
    password varchar(50) NOT NULL,
    -- Campi IA
    tipo_nota boolean NOT NULL DEFAULT false,
    lunghezza_nota boolean NOT NULL DEFAULT false,
    tipo_parametri varchar(400),
    testo_parametri varchar(2500)
);

-- 2. Creazione tabella Paziente
CREATE TABLE paziente (
    codice_fiscale varchar(16) PRIMARY KEY,
    nome varchar(30) NOT NULL,
    cognome varchar(30) NOT NULL,
    data_di_nascita date NOT NULL,
    email varchar(254) UNIQUE NOT NULL,
    password varchar(50) NOT NULL,
    med_id varchar(12) NOT NULL, -- Django aggiunge automaticamente '_id' alle ForeignKey

    FOREIGN KEY (med_id) REFERENCES medico(codice_identificativo)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 3. Creazione tabella Nota Diario
CREATE TABLE nota_diario (
    id serial PRIMARY KEY,
    paz_id varchar(16) NOT NULL, -- Django aggiunge '_id'
    testo_paziente text NOT NULL,
    testo_supporto text,
    testo_clinico text,
    testo_medico text,
    data_commento_medico timestamp with time zone NOT NULL, -- <-- LA NUOVA COLONNA
    emozione_predominante varchar(50),
    spiegazione_emozione text,
    contesto_sociale varchar(50),
    spiegazione_contesto text,
    data_nota timestamp NOT NULL,
    -- Modulo Emergenza
    is_emergency boolean NOT NULL DEFAULT false,
    tipo_emergenza varchar(20) NOT NULL DEFAULT 'none',
    messaggio_emergenza text,
    -- Stato IA
    generazione_in_corso boolean NOT NULL DEFAULT false,

    FOREIGN KEY (paz_id) REFERENCES paziente(codice_fiscale)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 4. Creazione tabella Messaggio
CREATE TABLE messaggio (
    id serial PRIMARY KEY,
    med_id varchar(12) NOT NULL,
    paz_id varchar(16) NOT NULL,
    testo text NOT NULL,
    data_messaggio date NOT NULL,
    mittente varchar(12) NOT NULL,

    FOREIGN KEY (paz_id) REFERENCES paziente(codice_fiscale)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (med_id) REFERENCES medico(codice_identificativo)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5. Creazione tabella Riassunto Caso Clinico
CREATE TABLE riassunto_caso_clinico (
    id serial PRIMARY KEY,
    paz_id varchar(16) NOT NULL,
    med_id varchar(12) NOT NULL,
    periodo varchar(10) NOT NULL,
    testo_riassunto text NOT NULL,
    data_generazione timestamp NOT NULL,

    FOREIGN KEY (paz_id) REFERENCES paziente(codice_fiscale)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (med_id) REFERENCES medico(codice_identificativo)
        ON UPDATE CASCADE ON DELETE CASCADE
);