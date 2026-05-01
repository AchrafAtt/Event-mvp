// Espace Cliente
GET /reservations → index
GET /reservations/create → create (wizard étape 1 : type événement)
POST /reservations → store
GET /reservations/{id} → show (récapitulatif + statut)
POST /reservations/{id}/recu → upload reçu paiement

// Espace Admin
GET /admin/dashboard → stats globales
GET /admin/reservations → liste avec filtres
PATCH /admin/reservations/{id}/statut → changerStatut
PATCH /admin/paiements/{id}/valider → validerPaiement
PATCH /admin/paiements/{id}/refuser → refuserPaiement
