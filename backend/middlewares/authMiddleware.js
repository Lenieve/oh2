const jwt = require('jsonwebtoken');

// Funktion zur Authentifizierung des JWT
exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Ungültiger oder abgelaufener Token.');
      }
      req.user = user.data; // Stelle sicher, dass du auf das richtige Objekt im verifizierten Token zugreifst
      next();
    });
  } else {
    return res.status(401).send('Zugriff verweigert. Kein Token vorhanden.');
  }
};

// Funktion zur Überprüfung der Rolle des Benutzers
exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send('Nicht authentifiziert.');
    }

    if (roles.indexOf(req.user.role) === -1) {
      return res.status(403).send('Zugriff verweigert. Sie haben nicht die erforderliche Rolle.');
    }
    next();
  };
};
