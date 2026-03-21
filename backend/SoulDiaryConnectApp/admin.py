from django.contrib import admin
from django import forms
from django.utils.html import format_html
from .models import Medico, Paziente, NotaDiario, Messaggio, RiassuntoCasoClinico


class MedicoAdminForm(forms.ModelForm):
	password = forms.CharField(widget=forms.PasswordInput(render_value=True), required=True)
	
	class Meta:
		model = Medico
		fields = '__all__'


class PazienteAdminForm(forms.ModelForm):
	password = forms.CharField(widget=forms.PasswordInput(render_value=True), required=True)
	
	class Meta:
		model = Paziente
		fields = '__all__'


class MedicoAdmin(admin.ModelAdmin):
	form = MedicoAdminForm
	search_fields = ['cognome', 'nome', 'codice_identificativo']
	list_display = ['codice_identificativo', 'nome', 'cognome', 'email', 'password_masked']
	
	def password_masked(self, obj):
		if obj.password:
			return '••••••••'
		return '-'
	password_masked.short_description = 'Password'


class PazienteAdmin(admin.ModelAdmin):
	form = PazienteAdminForm
	search_fields = ['cognome', 'nome', 'codice_fiscale']
	list_display = ['codice_fiscale', 'nome', 'cognome', 'email', 'password_masked']
	
	def password_masked(self, obj):
		if obj.password:
			return '••••••••'
		return '-'
	password_masked.short_description = 'Password'


admin.site.register(Medico, MedicoAdmin)
admin.site.register(Paziente, PazienteAdmin)
admin.site.register(NotaDiario)
admin.site.register(Messaggio)
admin.site.register(RiassuntoCasoClinico)
