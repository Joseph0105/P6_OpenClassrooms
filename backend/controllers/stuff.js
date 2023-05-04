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
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        dataModelsSauce
          .deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  dataModelsSauce
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  const sauceId = req.params.id;
  const userId = req.body.userId;
  const like = req.body.like;

  if (like === 1) {
    dataModelsSauce
      .updateOne(
        { _id: sauceId },
        {
          $inc: { likes: like },
          $push: { usersLiked: userId },
        }
      )
      .then((sauce) => res.status(200).json({ message: 'Sauce likée !' }))
      .catch((error) => res.status(500).json({ error }));
  } else if (like === -1) {
    dataModelsSauce
      .updateOne(
        { _id: sauceId },
        {
          $inc: { dislikes: -1 * like },
          $push: { usersDisliked: userId },
        }
      )
      .then((sauce) => res.status(200).json({ message: 'Sauce dislikée !' }))
      .catch((error) => res.status(500).json({ error }));
  } else {
    dataModelsSauce
      .findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          dataModelsSauce
            .updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
            .then((sauce) => {
              res.status(200).json({ message: 'Sauce dislikée !' });
            })
            .catch((error) => res.status(500).json({ error }));
        } else if (sauce.usersDisliked.includes(userId)) {
          dataModelsSauce
            .updateOne(
              { _id: sauceId },
              {
                $pull: { usersDisliked: userId },
                $inc: { dislikes: -1 },
              }
            )
            .then((sauce) => {
              res.status(200).json({ message: 'Sauce likée !' });
            })
            .catch((error) => res.status(500).json({ error }));
        }
      })
      .catch((error) => res.status(401).json({ error }));
  }
};
