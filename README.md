# Soundmatch

Eine einfache Webapp wie Tinder für Spotify-Songs:

- Lobby erstellen und Freunde hinzufügen
- Beliebte Songs pro Spieler auswählen
- In der Gruppe Song für Song mit **Ja/Nein** swipen
- Songs, die **alle** liken, landen in der gemeinsamen Playlist
- Mehrere Runden spielbar, damit die Playlist weiter wächst
- Für jeden Song gibt es direkt einen eingebetteten Spotify-Player zum Anhören

## Starten

Da es eine statische App ist, reicht ein einfacher Webserver:

```bash
cd <project-directory>
python3 -m http.server 4173
```

Dann im Browser öffnen:

`http://localhost:4173`
