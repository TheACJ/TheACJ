"""This is the settings file for my portfolio project"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-)t@cd5c$g_d13x*oe#cl*ne9@w#ou(^_u6%hks#q39%1sj7p2='

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'Home',
    'corsheaders',
    'rest_framework',

]

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'TheACJ.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'TheACJ.wsgi.application'


CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]


if not DEBUG:
	DATABASES = {
	   'default': {
        	'ENGINE': 'django.db.backends.mysql',  # Use 'mysql.connector.django' if using PyMySQL
      	  	'NAME': 'royalintschogoli_main',
        	'USER': '387994',
        	'PASSWORD': '0953Amanda',
        	'HOST': 'mysql-royalintschogoli.alwaysdata.net', 
        	'PORT': '3306', 
	    }
	}
else:
	DATABASES = {
   	   'default': {
        	'ENGINE': 'django.db.backends.sqlite3',
	        'NAME': BASE_DIR / 'db.sqlite3',
    	    }
	}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/


MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend/dist')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
"""
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "TheACJ@gmail.com"
NOTIFY_EMAIL = "TheACJ@gmail.com"
 """


# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_HOST_USER = '********'
EMAIL_HOST_PASSWORD = '******'
FILE_LOCKING = False

# X_FRAME_OPTIONS = 'ALLOWALL'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'