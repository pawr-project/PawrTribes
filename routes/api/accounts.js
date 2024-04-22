var express = require('express');
var moment = require('moment');
const {
  Nano
} = require('nanode');

const nano = new Nano({
  url: process.env.NODE_RPC
});
var router = express.Router();
var Account = require('../../models/account');
var nanorpc = require('../../nano/rpc_client');

var apicache = require('apicache');
let cache = apicache.middleware

router.get('/principals', cache('5 minutes'), function (req, res) {
  Account.find()
    .where('votingweight').gte((nanorpc.getOnlineStakeTotal() / 1000))
    .sort('-votingweight')
    .select('-_id account alias uptime votingweight delegators votelatency')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - All Reps", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/principals/online', cache('5 minutes'), function (req, res) {
  Account
    .find({
      'lastVoted': {
        $gt: moment().subtract(1, 'hours').toDate()
      }
    })
    .where('votingweight').gte((nanorpc.getOnlineStakeTotal() / 1000))
    .sort('-votingweight')
    .select('-_id account alias uptime votingweight delegators')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - All Reps", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/aliases', cache('5 minutes'), function (req, res) {
  Account.find({
    'alias': {
      $exists: true,
      $ne: null
    }
  })
    .select('-_id account alias')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - Aliases", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/monitors', cache('5 minutes'), function (req, res) {
  Account.find({
    'monitor.url': {
      $exists: true,
      $ne: null
    }
  })
    .select('-_id account monitor')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - Aliases", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/geo', cache('5 minutes'), function (req, res) {
  Account.find({
    'location.latitude': {
      $exists: true,
      $ne: null
    }
  })
    .sort('-votingweight')
    .select('-_id account alias votingweight location')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - All Reps", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/providers', cache('5 minutes'), function (req, res) {
  Account.find({
    'network.provider': {
      $exists: true,
      $ne: null
    }
  })
    .sort('-votingweight')
    .select('-_id account alias votingweight network.provider')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - All Reps", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/votelatency', cache('5 minutes'), function (req, res) {
  Account.find({
    'votelatency_current': {
      $exists: true,
      $ne: null
    }
  })
    .select('-_id account alias votingweight votelatency votelatency_current')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - All Reps", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/recommended', function(req, res) {
  res.redirect('/api/accounts/verified');
});

router.get('/verified', cache('5 minutes'), function (req, res) {
  Account.find({
    'owner': {
      $exists: true,
      $ne: null
    },
    'lastVoted': {
      $gt: moment().subtract(1, 'day').toDate()
    },
    'closing': false,
    'avoid': false,
  })
    .where('votingweight').gt(0)
    /*.where('score').gte(80)*/
    .sort('-score')
    .select('-_id account alias uptime votingweight delegators score')
    .exec(function (err, accounts) {
      if (err) {
        console.log("API - All Reps", err);
        return;
      }
      res.json(accounts);
    });
});

router.get('/:account', function (req, res) {
  var myaccount = req.params.account;

  if(myaccount.startsWith('xrb_')){
    return res.redirect('/account/' + myaccount.replace(/xrb_/g, "nano_"))
  }

  Account.findOne({
    $or: [
      { 'account': myaccount },
      { 'slug': myaccount }
    ]
  })
    .select('-_id account alias slug uptime uptime_over created lastVoted votelatency votelatency_current votingweight ' +
    'delegators description website rewards server network.provider location monitor score verified donation closing avoid telemetry')
    .exec(function (err, account) {
      if (err || !account) {
        console.log("API - Account", err, req.params.account);
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json(account);
    });
});

router.get('/:account/history', function (req, res) {
  nano.accounts.history(req.params.account, 20)
    .then(history => {
      if (!history) return res.status(404).json({ error: 'Not found' });

      res.json(history);
    })
    .catch(reason => {
      res.status(500).json({ error: 'Not found' });
      console.log('API - Account history', reason)
    });
});

router.get('/:account/pending', function (req, res) {
  nano.rpc('pending', {
    account: req.params.account,
    threshold: '1000000000000000000000000',
    source: true,
    include_active: true
  })
    .then(history => {
      if (!history) return res.status(404).json({ error: 'Not found' });

      res.json(history);
    })
    .catch(reason => {
      res.status(500).json({ error: 'Not found' });
      console.log('API - Account pending', reason)
    });
});

router.get('/:account/info', function (req, res) {
  nano.rpc('account_info', {
    account: req.params.account,
    representative: true,
    weight: true,
    pending: true
  })
    .then(response => {
      if (!response) return res.status(404).json({ error: 'Not found' });

      res.json(response);
    })
    .catch(reason => {
      res.status(500).json({ error: 'Not found' });
      console.log('API - Account info', reason)
    });
});

module.exports = router;