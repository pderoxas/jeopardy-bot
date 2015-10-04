import {Schema, model} from 'mongoose';

export const schema = new Schema({
  // Their slack username:
  username: {
    type: String,
    required: true
  },
  // Their slack ID:
  slackid: {
    type: String,
    required: true,
  },
  // Their actual name (pretty printing):
  fullName: {
    type: String,
    required:true
  },

  // Trebek can be insulting to sassy users:
  sassFactory: {
    type: Number,
    default: 0
  },

  // The money a user has in the active game.
  // Not stored in the game because we don't really care about it there.
  // This jeopardy should be super fluid.
  // At the end of the rounds, this is flushed into the stats money.
  currentMoney: {
    type: Number,
    default: 0
  },

  // Simple stats:
  stats: {
    // Aggregate of all of the money won/lost from all games.
    money: {
      type: Number,
      default: 0
    },
    // Number of games won:
    won: {
      type: Number,
      default: 0
    },
    // Number of games lost: 
    lost: {
      type: Number,
      default: 0
    }
  }
});

schema.statics.won = async function(username) {
  const user = await this.getUser(username);
  user.won++;
  return this.endGameForUser(username);
};

schema.statics.lost = async function(username) {

};

schema.statics.getUser = async function(username) {

};

schema.statics.endGameForUser = async function(username) {

};

export const Person = model('Person', schema);