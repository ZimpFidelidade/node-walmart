Node Walmart
=========
[![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![NPM Version][node-image]][node-url] [![Coverage Status][coverrals-image]][coverrals-url]

[![Node Build][nodei-image]][nodei-url]

A library for Walmart API

## Você trabalha no Walmart?

Não se preocupe, este repositório não contem nenhuma informação sensível sendo apenas um empacotamento da API pública para clientes B2B para ser usado na plataforma Nodejs e não contém nenhuma chave de acesso, rotas privadas ou algo parecido. Caso você queira entrar em contato sobre este repositório você pode postar uma issue clicando aqui ou através do email suporte@zimp.me

## Suporte para API

De acordo com a comunicação interna da Walmart, visando a melhoria do fluxo de atendimento disponibilizamos um novo canal para solicitações de natureza técnica.
A partir de agora, qualquer questão relacionada a integração via Walmart API deve ser direcionada para o grupo apib2bhom@wal-mart.com

## Installation

```shell
$ npm install --save walmart-b2b
```

## How it works
```js
const walmart = require('walmart-b2b').init({
	code: 123,
	id: 'test',
	secret: 'test'
});

walmart.getFullCatalog().then(console.log).catch(console.error);
walmart.sendOrder(orderObj).then(console.log).catch(console.error);

```

## Tests
`npm test`

## Contributing
Please, check the [Contributing](CONTRIBUTING.md) documentation, there're just a few steps.

## Support or Contact

Having trouble? Or new ideas? Post a new issue! We will be glad to help you!

## License

[MIT License](http://luanmuniz.mit-license.org) © Luan Muniz

[travis-url]: https://travis-ci.org/ZimpFidelidade/node-walmart
[travis-image]: https://travis-ci.org/ZimpFidelidade/node-walmart.png?branch=master
[depstat-url]: https://david-dm.org/ZimpFidelidade/node-walmart#info=devDependencies
[depstat-image]: https://david-dm.org/ZimpFidelidade/node-walmart/dev-status.png
[nodei-image]: https://nodei.co/npm/walmart-b2b.png
[nodei-url]: https://nodei.co/npm/walmart-b2b
[node-image]: https://badge.fury.io/js/walmart-b2b.svg
[node-url]: http://badge.fury.io/js/walmart-b2b
[coverrals-image]: https://coveralls.io/repos/github/ZimpFidelidade/node-walmart/badge.svg?branch=master
[coverrals-url]: https://coveralls.io/github/ZimpFidelidade/node-walmart?branch=master
