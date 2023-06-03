const fs = require('fs');
const dataModelsSauce = require('../models/DataModelsSauce');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new dataModelsSauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersDisliked: [],
    usersLiked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  dataModelsSauce
    .findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))

    .catch((error) => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete sauceObject._userId;
  dataModelsSauce
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        dataModelsSauce
          .updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: 'Objet modifié' }))
          .catch((error) => res.status(404).json({ error }));
      }
    })
    .catch((error) => res.status(401).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  dataModelsSauce
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) throw new Error('Non autorisé');
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        dataModelsSauce
          .deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error });
    });
};

exports.getAllSauces = (req, res, next) => {
  dataModelsSauce
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateSauce = (req, res, next) => {
  // Recherche de la sauce avec l'ID spécifié dans les paramètres de la requête
  dataModelsSauce
    .findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si la sauce n'est pas trouvée, retourne un message d'erreur avec un statut 404
      if (!sauce) {
        return res.status(404).json({ message: 'Sauce not found' });
      }

      // Trouve l'index de l'utilisateur actuel dans les tableaux usersLiked et usersDisliked
      const userLikedIndex = sauce.usersLiked.indexOf(req.auth.userId);
      const userDislikedIndex = sauce.usersDisliked.indexOf(req.auth.userId);

      // Si l'utilisateur veut liker la sauce et qu'il ne l'a ni likée ni dislikée auparavant
      if (
        req.body.like === 1 &&
        userLikedIndex === -1 &&
        userDislikedIndex === -1
      ) {
        // Ajoute l'utilisateur aux utilisateurs ayant liké la sauce et incrémente le compteur de likes
        sauce.usersLiked.push(req.auth.userId);
        sauce.likes += 1;
      }
      // Sinon, si l'utilisateur veut disliker la sauce et qu'il ne l'a ni likée ni dislikée auparavant
      else if (
        req.body.like === -1 &&
        userDislikedIndex === -1 &&
        userLikedIndex === -1
      ) {
        // Ajoute l'utilisateur aux utilisateurs ayant disliké la sauce et incrémente le compteur de dislikes
        sauce.usersDisliked.push(req.auth.userId);
        sauce.dislikes += 1;
      }
      // Sinon, si l'utilisateur veut annuler son like ou dislike
      else if (req.body.like === 0) {
        // Si l'utilisateur a liké la sauce précédemment
        if (userLikedIndex !== -1) {
          // Retire l'utilisateur des utilisateurs ayant liké la sauce et décrémente le compteur de likes
          sauce.usersLiked.splice(userLikedIndex, 1);
          sauce.likes -= 1;
        }
        // Si l'utilisateur a disliké la sauce précédemment
        if (userDislikedIndex !== -1) {
          // Retire l'utilisateur des utilisateurs ayant disliké la sauce et décrémente le compteur de dislikes
          sauce.usersDisliked.splice(userDislikedIndex, 1);
          sauce.dislikes -= 1;
        }
      }
      // Sinon, si la valeur de like est invalide ou si l'utilisateur a déjà liké ou disliké la sauce
      else {
        // Retourne un message d'erreur avec un statut 400
        return res
          .status(400)
          .json({ message: 'Invalid like value or user already rated' });
      }

      // Sauvegarde la sauce mise à jour dans la base de données
      sauce
        .save()
        .then(() => res.status(200).json({ message: 'Sauce rated' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
