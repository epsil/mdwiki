Installasjon
============

1.  Plasser wikien i `/Users/vegard/Documents/wiki`
    (eller lag en symlink derfra til wikiens plassering).
2.  Påse at skriptet `start_httpserver.sh` er kjørbart
    (med `chmod +x start_httpserver.sh`.)
3.  Kopier filen `com.personalwiki.httpserver.plist` til
    `~/Library/LaunchAgents/com.personalwiki.httpserver.plist`.
4.  Gi filen eksklusive rettigheter:
    `chmod 600 ~/Library/LaunchAgents/com.personalwiki.httpserver.plist`.
5.  Wikien krever [Node][1].

[1]: https://nodejs.org/en/
