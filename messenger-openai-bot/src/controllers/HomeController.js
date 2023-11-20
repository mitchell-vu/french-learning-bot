import fs from 'fs';

const getHomePage = (req, res) => {
  return res.render('homepage.ejs');
};

const getTarotCards = (req, res) => {
  const tarotCards = JSON.parse(fs.readFileSync('src/data/tarot.json', 'utf8'));

  // Get random card
  const randomCardIndex = Math.floor(Math.random() * tarotCards.cards.length);
  const randomCard = tarotCards.cards[randomCardIndex];

  return res.render('tarot.ejs', {
    card: randomCard,
  });
};

export default {
  getHomePage,
  getTarotCards,
};
