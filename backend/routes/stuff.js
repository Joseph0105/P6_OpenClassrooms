const express = require('express');
const router = express.Router();

const stuffCtrl = require('../controllers/stuff');

router.post('/', stuffCtrl.createSauce);

router.put('/:id', (req, res, next) => {
  dataModelsSauce
    .updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié' }))
    .catch((error) => res.status(400).json({ error }));
});

router.delete('/:id', (req, res, next) => {
  dataModelsSauce
    .deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé' }))
    .catch((error) => res.status(400).json({ error }));
});

router.get('/:id', (req, res, next) => {
  dataModelsSauce
    .findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json({ sauces }))
    .catch((error) => res.status(404).json({ error }));
});

router.get('/', (req, res, next) => {
  dataModelsSauce
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = router;
