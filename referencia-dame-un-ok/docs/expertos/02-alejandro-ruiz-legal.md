# 🔒 Alejandro Ruiz — Abogado RGPD / Legaltech

## Área de Conocimiento
Protección de datos, RGPD, responsabilidad civil, apps de salud/bienestar, regulación de dispositivos médicos UE.

## Aplicación al Proyecto

### Blindaje legal esencial
- **Disclaimer:** "Dame un Ok" NO es un dispositivo médico ni un servicio de emergencias. Disclaimer en ToS, onboarding y emails.
- **RGPD:** Datos de check-in = datos de bienestar. Si se cruzan con ubicación = potencialmente datos de salud (Art. 9). Evaluación de Impacto obligatoria.
- **Consentimiento terceros:** Los contactos de emergencia reciben datos del usuario. Necesitan consentir explícitamente.
- **IoT:** Cada dispositivo recopila datos (hora de pulsación, ubicación implícita, patrones). Información clara al usuario.
- **Impresora:** Los mensajes impresos son datos personales en papel. Considerar quién más puede leerlos.
- **SMS/USSD:** Retención de logs de SMS — política clara de borrado.

### Documentos legales necesarios
1. Términos de Servicio (app + dispositivos)
2. Política de Privacidad (RGPD compliant)
3. Evaluación de Impacto (DPIA)
4. Contrato de procesamiento de datos (si usamos Twilio/SendGrid)
5. Disclaimer de responsabilidad (prominente, no enterrado)
6. Consentimiento de contactos de emergencia
