Installation
============

1.  Place the wiki in `/Users/username/Documents/wiki`
    (or create a symlink to the wiki's location).
2.  Ensure that the script `start_httpserver.sh` is executable
    (with `chmod +x start_httpserver.sh`.)
3.  Copy the file `com.personalwiki.httpserver.plist` to
    `~/Library/LaunchAgents/com.personalwiki.httpserver.plist`.
4.  Give the file exclusive access rights:
    `chmod 600 ~/Library/LaunchAgents/com.personalwiki.httpserver.plist`.
5.  The wiki requires [Node][1].

[1]: https://nodejs.org/en/