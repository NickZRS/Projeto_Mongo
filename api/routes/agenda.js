/**API REST da agenda */

import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} =  await connectToDatabase()
const nomeCollection = 'agenda'

import auth from '../middleware/auth.js'

const validaAgenda = [
    check('titulo')
    .not().isEmpty().trim().withMessage('O título é obrigatório'),

    check('custo')
    .isNumeric().withMessage('O custo só deve conter números')
    .isLength({min: 3, max: 16}).withMessage('O custo deve conter entre 3 digitos a 16'),

    check('local')
    .not().isEmpty().trim().withMessage('É obrigatorio informar o local')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .withMessage('O local não deve ter caracteres especiais')
    .isLength({min: 3}).withMessage('O local é muito curto. Mínimo 3')
    .isLength({max: 48}).withMessage('O local é muito longo. Máximo de 48'),

    check('participantes').optional({nullable: true})



]

/**
 * GET /api/agenda
 * Lista toda a agenda de eventos
 */

router.get('/',auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find().sort({titulo: 1})
        .toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a listagem da agenda',
                param: '/'
            }]
        })
    }
})

/**
 * GET /api/agenda/id/:id
 * Lista toda a agenda de eventos
 */
router.get('/id/:id' , auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/agenda/titulo/:titulo
 * Lista toda a agenda de eventos pelo titulo
 */
router.get('/titulo/:titulo' , auth, async(req, res) => {
    try{
        db.collection(nomeCollection).find({'titulo': 
        {$regex: req.params.titulo, $options: "i"}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})
/**
 * DELETE /api/agenda/:id
 * Apaga o evento pelo id
 */

router.delete('/:id', auth, async(req, res) => {
    await db.collection(nomeCollection).deleteOne({"_id": {$eq: ObjectId(req.params.id)}}).then(result => res.status(200).send(result)).catch(err => res.status(400).json(err))
})

/**
 * POST /api/agenda
 * Insere um novo evento a agenda
 */
router.post('/', auth, validaAgenda, async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else{
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err =>res.status(400).json(err))
    }
})
 

/**
 * PUT /api/agenda
 * Altera um evento da agenda
 */
router.put('/', validaAgenda, auth, async(req, res) => {
    let idDocumento = req.body._id //armazanando o id do documento
    delete req.body._id //iremos remover o id do body

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq: ObjectId (idDocumento)}},
                   { $set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})
export default router