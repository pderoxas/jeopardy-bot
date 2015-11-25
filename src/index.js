import 'babel/polyfill';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import {join} from 'path';
import {dust} from 'adaro';
import basicAuth from 'basic-auth-connect';
 
import App from './models/App';
import Studio from './models/Studio';
import SlackBot from './bot';
import Webhook from './webhook';
import {broadcast} from './trebek';
import * as config from './config';

mongoose.connect(config.MONGO);

const app = express();

app.engine('dust', dust({
  cache: false,
  helpers: [
    'dustjs-helpers',
    dust => {
      dust.helpers.iter = (chunk, context, bodies, params) => {
        const obj = context.resolve(params.obj);
        const iterable = [];
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            iterable.push({
              $key: key,
              $value: value
            });
          }
        }
        return chunk.section(iterable, context, bodies);
      };
    }
  ]
}));
app.set('view engine', 'dust');
app.set('views', join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Install landing page:
app.get('/welcome', (req, res) => {
  res.render('welcome');
});

// Admin Routes:
app.use('/admin', basicAuth('jeopardy', 'airbnb'));
app.get('/admin', (req, res) => {
  res.redirect('/admin/home');
});
app.get('/admin/:view', async (req, res) => {
  const a = await App.get();
  const studios = await Studio.find();
  let studio;
  if (req.query.studio) {
    studio = studios.find(s => s.name === req.query.studio);
    if (!studio) {
      return res.sendStatus(404);
    }
    studio = studio.toObject();
  }
  res.render(`admin/${req.params.view}`, {
    studios,
    studio,
    app: a,
    // stats,
    query: req.query
  });
});

// Admin routes that update configuration:
app.post('/admin/update/studio', async (req, res) => {
  const studio = await Studio.findOne({
    id: req.body.id,
    name: req.body.studio
  });
  if (req.body.feature) {
    studio.features[req.body.feature].enabled = req.body.enabled;
  } else if (req.body.toggle) {
    studio.enabled = !studio.enabled;
  }
  await studio.save();
  res.redirect(`/admin/studio?studio=${req.body.studio}`);
});
app.post('/admin/update/app', async (req, res) => {
  // TODO: App Module:
  const a = await App.get();
  a[req.body.name] = req.body.value;
  await a.save();
  res.send('ok');
});
app.post('/admin/broadcast', (req, res) => {
  if (req.body.studio) {
    broadcast(req.body.message, req.body.id);
    res.redirect(`/admin/studio?studio=${req.body.studio}`);
  } else {
    broadcast(req.body.message);
    res.redirect('/admin/home');
  }
});

app.get('/renderable/categories', (req, res) => {
  const datas = decodeURIComponent(req.query.data).split('@@~~AND~~@@');
  res.render('categories', {
    datas
  });
});

const clueExtra = /^\(([^)]+)\)\s*\.?/;
app.get('/renderable/clue', (req, res) => {
  let extra;
  let data = req.query.data;
  const extraRegexResult = clueExtra.exec(data);
  if (extraRegexResult) {
    data = data.substring(extraRegexResult[0].length);
    extra = extraRegexResult[1];
  }
  res.render('clue', {
    data,
    extra
  });
});

// Boot up the jeopardy app:
app.listen(config.PORT, async () => {
  const a = await App.get();
  console.log(`Jeopardy Bot listening on port ${config.PORT}`);
  // If we're in a mode that needs the webhook, then set it up:
  if (a.isBot()) {
    new SlackBot();
  } else {
    new Webhook(app);
  }
});
