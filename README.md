# SoulDiaryConnect

**SoulDiaryConnect** is an AI-powered system designed to support patients in their **psychotherapeutic journey** by enabling journaling with **personalized AI feedback**, while keeping the **therapist connected and in control**. 
The platform allows patients to **log daily experiences**, receive **AI-generated motivational and clinical feedback**, and stay in touch with their physician.
The AI used is [Llama 3.1:8B](https://ollama.com/library/llama3.1:8b), running locally via [Ollama](https://ollama.com/).
<p align="center">
  <img src="https://github.com/FLaTNNBio/SoulDiaryConnect2.0/blob/main/media/2-01.png" width="250" alt="Logo SoulDiaryConnect">
</p>

---

## Features

- **AI-Assisted Journaling** – Patients can document their daily experiences and receive **motivational feedback** from an LLM.
- **Personalized AI** – Doctors can **configure AI responses** to provide **clinical insights** and tailor support to each patient.
- **Intuitive User Interface** – A web application with **dedicated patient and doctor dashboards**.
- **Secure Data Management** – Uses **PostgreSQL** for structured data storage.
- **Advanced NLP Processing** – Powered by **Llama 3.1:8B**, running locally with **Ollama**.
- **Multi-User Access** – Patients and doctors have separate roles and functionalities.

---

## Tech Stack

- **Backend**: Django
- **Frontend**: React Native
- **NLP**: Llama 3.1:8B via Ollama
- **Database**: PostgreSQL

---

## Installation Guide

### **1️. Clone the repository**
```sh
git clone https://github.com/FLaTNNBio/SoulDiaryConnect-App.git
cd SoulDiaryConnectApp
```

### **2. Backend setup (Django & Database)**

#### **2.1. Set up the virtual environment and install dependencies**
Navigate to the backend folder and create a specific Python 3.13 environment:
```sh
cd .\backend\
py -3.13 -m venv .venv
.venv\Scripts\activate  # on Linux source venv/bin/activate
pip install -r requirements.txt
```
Note: If you encounter permission errors during this step, try running the Command Prompt as Administrator.


#### **2.2. Configure the database (PostgreSQL)**
Install PostgreSQL following the [Official guidelines](https://www.postgresql.org/download/).<br>
Enter the database shell to execute the initial queries:
```sh
python manage.py dbshell
\i souldiaryconnect.sql
```
Edit **settings.py** to configure your credentials:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'souldiaryconnect',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Run migrations:
```sh
python manage.py makemigrations
python manage.py migrate
```

#### **2.3. Install and configure Ollama (Local AI Engine)**
Download and install Ollama from the [official website](https://ollama.com/download):

- **Windows**: Download the installer and follow the setup wizard
- **macOS**: `brew install ollama` or download from the website
- **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`

Once Ollama is installed, open a terminal and run:

```sh
ollama pull llama3.1:8b
```

This will download the Llama 3.1:8B model (~4.7GB).


Start the Ollama service (it usually starts automatically after installation):

```sh
ollama serve
```

Verify it's working:

```sh
ollama list
```

You should see `llama3.1:8b` in the list of available models.

> **Note**: Ollama runs on `http://localhost:11434` by default. The application is configured to connect to this endpoint automatically.

#### **2.4. Start the server**
```sh
python manage.py runserver
```

#### **2.5. Expose the server to the Mobile App (via Ngrok)**
Since the React Native mobile app cannot directly access your computer's localhost, you need to expose the local Django server to the internet using Ngrok.

- Download and install Ngrok.
- Open a new terminal window (leave the Django server running in the first one).
- Authenticate your Ngrok agent (you only need to do this once):
```sh
ngrok config add-authtoken YOUR_NGROK_TOKEN
```
- Start the HTTP tunnel on port 8000:
```sh
ngrok http 8000
```
- Ngrok will generate a public URL (e.g., https://your-ngrok-link.ngrok-free.app). Copy this URL.

> **Note**: Before starting the React Native app, you must configure the API connection.
- Navigate to the **frontend/src/constants/ directory**.
- Create a new file named **Config.ts** (if it doesn't already exist).
- Add the following line of code, replacing the placeholder with your copied Ngrok link:
```sh
export const API_URL = 'https://your-ngrok-link.ngrok-free.app';
```
### **3. Frontend setup (React Native)**
#### **3.1. Install dependencies**
Open a new terminal window, navigate to the frontend directory, and install the required packages:
```sh
cd .\frontend\
npm install
```
#### **3.2. Configure the API connection (Ngrok)**
(Reminder) Ensure you have created the Config.ts file in src/constants/ with your active Ngrok URL, as detailed in the Backend setup (Step 2.5).

#### **3.3. Generate the native build (Android)**
Since the app uses native modules for the microphone, you need to generate the Android folder and build the local Dev Client. This step compiles the native code:

```sh
npx expo prebuild --platform android --clean
```

#### **3.4. Run the app on an emulator (or physical device)**
Ensure you have an Android emulator running (via Android Studio) or a physical device connected with USB debugging enabled, then run:
```sh
npx expo run:android
```




## **Roles & Functionality**
### Doctor
- **Manage patients** – Access and review patient journal entries.
- **Customize AI responses** – Configure the AI to tailor feedback generation.
- **Monitor therapy progress** – View clinical trends and intervene when necessary.
### Patient
- **Write personal journal entries** – Document daily thoughts and emotions.
- **Receive AI-generated feedback** – Get motivational and therapeutic insights.
- **View therapist's comments** – See personalized feedback from the doctor.
