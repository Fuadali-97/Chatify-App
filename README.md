# Chatify - React Chat App

Det här är mitt projekt i kursen Avancerad webbutveckling med JavaScript på Jensen Yrkeshögskola.  
Jag har byggt en liten chattapp där man kan skapa konto, logga in och skicka meddelanden via ett API.

## Vad man kan göra
- Registrera sig med användarnamn, e-post och lösenord  
- Logga in och se sitt användarnamn och avatar  
- Skriva och radera egna meddelanden  
- Chatta med en fejkad “AutoBot” som svarar på svenska  
- Fungerar både på dator och mobil  

## Tekniker
React, Vite, React Router, Axios, DOMPurify, jwt-decode och vanlig CSS.

## Säkerhet
Jag har lagt in grundläggande säkerhet:
- CSP-policy i `index.html` för att styra vilka bilder som får laddas  
- CSRF-skydd vid POST/DELETE-anrop  
- DOMPurify för att sanera text  
- JWT-token vid inloggning för autentisering  

## API
Appen använder Chatify-API på  
https://chatify-api.up.railway.app/  
för att hämta, skapa och ta bort meddelanden.

## Så här kör man appen lokalt
1. Ladda ner projektet  
2. Öppna terminalen i projektmappen  
3. Kör `npm install`  
4. Kör `npm run dev`  
5. Gå till http://localhost:5173  

## Publicering
Appen ligger uppe på Netlify och fungerar som en vanlig enkel SPA-app.

## Om projektet
 
Jag har testat allt både lokalt och på Netlify och är nöjd med resultatet.  
Det här var en rolig uppgift där jag lärde mig mycket om hur man jobbar med API-anrop, säkerhet och React.

Namn: Fuad Ali  
Kurs: Avancerad webbutveckling med JavaScript  
Länk till publicerad app: (läggs till efter deployment)

AutoBot-chatten finns bara när jag kör appen lokalt i utvecklingsläge.  
I den riktiga versionen används det riktiga Chatify-API:t.
