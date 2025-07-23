from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile
from django.contrib.auth.forms import AuthenticationForm

class CustomLoginForm(AuthenticationForm):
    username = forms.CharField(label="Nom d'utilisateur / Benutzername")
    password = forms.CharField(label="Mot de passe / Passwort", widget=forms.PasswordInput)

class SignUpForm(UserCreationForm):
    username = forms.CharField(max_length=30, label="Pseudo / Benutzername")
    age_range = forms.ChoiceField(choices=Profile.AGE_RANGE_CHOICES, label="Tranche d'âge / Altersgruppe")
    gender = forms.ChoiceField(choices=Profile.GENDER_CHOICES, label="Genre / Geschlecht")
    country = forms.ChoiceField(choices=Profile.COUNTRY_CHOICES, label="Pays / Land")

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2', 'age_range', 'gender', 'country')
