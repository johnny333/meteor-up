import { addLocation, combineErrorDetails, serversExist } from './utils';

import joi from 'joi';

const schema = joi.object().keys({
  name: joi.string().min(1).required(),
  path: joi.string().min(1).required(),
  port: joi.number(),
  servers: joi.object().required(),
  deployCheckWaitTime: joi.number(),
  enableUploadProgressBar: joi.bool(),
  dockerImage: joi.string(),
  docker: joi.object().keys({
    image: joi.string().trim(),
    args: joi.array().items(joi.string().label('docker.args array items'))
  }),
  buildOptions: joi.object().keys({
    serverOnly: joi.bool(),
    debug: joi.bool(),
    cleanAfterBuild: joi.bool(),
    mobileSettings: joi.object(),
    executable: joi.string()
  }),
  env: joi.object().keys({
    'ROOT_URL': joi.string().required(),
    'MONGO_URL': joi.string()
  }).pattern(/[\s\S]*/, joi.string()),
  log: joi.object().keys({
    driver: joi.string(),
    opts: joi.object()
  }),
  volumes: joi.object(),
  ssl: joi.object().keys({
    autogenerate: joi.object().keys({
      email: joi.string().email().required(),
      domains: joi.string().required()
    }).label('autogenerate'),
    crt: joi.string().trim(),
    key: joi.string().trim(),
    port: joi.number()
  }).and('crt', 'key')
    .without('autogenerate', ['crt', 'key'])
    .or('crt', 'autogenerate')
    .label('ssl')
});

export default function (config) {
  let details = [];
  // console.log( joi.validate(config.meteor, schema, {convert: false}))
  details = combineErrorDetails(details, joi.validate(config.meteor, schema, {convert: false}));
  if (config.meteor.name.indexOf(' ') > -1) {
    details.push({
      message: '"name" has a space'
    });
  }
  details = combineErrorDetails(details, serversExist(config.servers, config.meteor.servers));

  return addLocation(details, 'meteor');
}
