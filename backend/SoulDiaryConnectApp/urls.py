from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),  
    path('login/', views.login_view, name='login'),  
    path('register/', views.register_view, name='register'), 
    path('logout/', views.home, name='logout'),
    path('doctor/profile/', views.get_doctor_profile, name='doctor_profile'),
    path('doctor/patients/', views.get_doctor_patients, name='doctor_patients'),
    path('doctor/patients/<str:codice_fiscale>/', views.get_patient_details, name='doctor_details_patient'),
    path('doctor/patients/<str:codice_fiscale>/notes/', views.get_patient_notes, name='get_patient_notes'),
    path('doctor/patients/<str:codice_fiscale>/notes/<int:note_id>/', views.get_pat_note_details, name='get_patient_note_details'),

    
    path('patient/note/create/', views.create_nota, name='create_note'),
    path('patient/note/', views.get_note, name='get_note'),
    path('patient/info/', views.get_patient_info, name='get_patient_info'),
    path('patient/doctor/', views.get_doctor_info, name='get_doctor_info'),
    path('patient/note/<int:pk>/', views.get_note_details, name='get_note_details'),
    path('patient/note/<int:pk>/delete/', views.delete_nota, name='delete_nota'),
    path('patient/note/<int:nota_id>/generate-support/', views.generate_note_support, name='generate-support'),
    

    

    # path('medico/home/', views.medico_home, name='medico_home'),
    # path('medico/analisi/', views.analisi_paziente, name='analisi_paziente'),
    # path('medico/riassunto/', views.riassunto_caso_clinico, name='riassunto_caso_clinico'),
    # path('paziente/home/', views.paziente_home, name='paziente_home'),
    # path('medico/note/<int:nota_id>/modifica/', views.modifica_testo_medico, name='modifica_testo_medico'),
    # path('medico/personalizza/', views.personalizza_generazione, name='personalizza_generazione'),
    # path('paziente/note/<int:nota_id>/elimina/', views.elimina_nota, name='elimina_nota'),
    # path('paziente/note/<int:nota_id>/genera-supporto/', views.genera_frase_supporto_nota, name='genera_frase_supporto_nota'),
    # path('medico/rigenera_frase_clinica/', views.rigenera_frase_clinica, name='rigenera_frase_clinica'),
    # path('api/nota/<int:nota_id>/stato/', views.controlla_stato_generazione, name='controlla_stato_generazione'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
