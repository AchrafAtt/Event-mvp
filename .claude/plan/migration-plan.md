users → id, nom, email, password, role, telephone, ville
reservations → id, reference, user_id, type_service, type_offre,
date_reservation, statut, prix_total, avance,
reste_a_payer, remarques
evenements → id, reservation_id, type_evenement, date, horaire,
zone, adresse_detaillee, nombre_personnes,
local_naissance, nom_clinique, -- Naissance
theme_anniversaire, -- Anniversaire
type_ceremonie -- Graduation
personnalisations → id, reservation_id, style_decoration,
texte_personnalise, remarques, tarif_fixe,
prix_par_personne, nombre_personnes
paiements → id, reservation_id, montant_avance, mode_paiement,
statut_paiement, date_paiement
recus_paiement → id, paiement_id, nom_fichier, type_fichier,
chemin_fichier, date_import
coordonnees_bancaires → id, banque, titulaire, rib
