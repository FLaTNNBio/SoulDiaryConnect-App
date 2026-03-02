from .auth_views import login_view, register_view, logout_view
from .general_views import home
from .doctor_views import get_doctor_profile, get_doctor_patients, get_patient_details, get_patient_notes, get_pat_note_details,add_clinical_comment, regenerate_clinical_analysis, get_or_generate_clinical_summary, get_patient_mood_stats
from .patient_views import create_nota, get_note, get_patient_info, get_doctor_info, get_note_details, delete_nota, generate_note_support
