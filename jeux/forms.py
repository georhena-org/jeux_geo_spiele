from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile

class SignUpForm(UserCreationForm):
    username = forms.CharField(max_length=30, label="Pseudo / Benutzername")
    age = forms.IntegerField(label="Âge / Alter")
    gender = forms.ChoiceField(choices=Profile.GENDER_CHOICES, label="Genre / Geschlecht")
    country = forms.ChoiceField(choices=Profile.COUNTRY_CHOICES, label="Pays / Land")

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2', 'age', 'gender', 'country')
