// Typing passages: 100 famous quotes, speeches, literary passages, and movie
// excerpts, each roughly 25-35 words long. A game draws 5 at random.
//
// Multiplayer stays consistent because the host's 5 picks are saved into the
// lobby row, so everyone on the same link races the identical five while a new
// link draws five fresh ones.
//
// Everything here is plain ASCII (straight apostrophes, no em-dashes or curly
// quotes) so every character can actually be typed. A few film entries stitch
// together that movie's most iconic lines to reach the target length.

export const QUOTES: string[] = [
  // --- Speeches & history ---
  `Four score and seven years ago our fathers brought forth on this continent a new nation, conceived in liberty, and dedicated to the proposition that all men are created equal.`,
  `I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.`,
  `And so, my fellow Americans, ask not what your country can do for you, ask what you can do for your country, and together let us go forth to lead the land we love.`,
  `We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall fight in the hills; we shall never surrender.`,
  `The only thing we have to fear is fear itself, the nameless, unreasoning, unjustified terror which paralyzes needed efforts to convert retreat into advance in every dark hour of our national life.`,
  `It is not the critic who counts, not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man in the arena.`,
  `Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? I know not what course others may take, but as for me, give me liberty, or give me death.`,
  `I have cherished the ideal of a democratic and free society in which all persons live together in harmony and with equal opportunities. It is an ideal which I hope to live for and to achieve.`,
  `Success is not final, failure is not fatal: it is the courage to continue that counts. This is not the end; it is not even the beginning of the end, but it is the end of the beginning.`,
  `Government of the people, by the people, for the people, shall not perish from the earth, and this nation, under God, shall have a new birth of freedom for all who come after us.`,

  // --- Literary openings ---
  `It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.`,
  `It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife, however little known the feelings of such a man may be.`,
  `Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little.`,
  `It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the doors.`,
  `In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell, but a hobbit hole, and that means comfort.`,
  `Happy families are all alike; every unhappy family is unhappy in its own way. Everything was in confusion in the house, and the wife had discovered that her husband had been carrying on an affair.`,
  `Whether I shall turn out to be the hero of my own life, or whether that station will be held by anybody else, these pages must show, for I was born and grew up as you will see.`,
  `If you really want to hear about it, the first thing you will probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all.`,
  `Persons attempting to find a motive in this narrative will be prosecuted; persons attempting to find a moral in it will be banished; persons attempting to find a plot in it will be shot.`,
  `I am no bird; and no net ensnares me: I am a free human being with an independent will, which I now exert to leave you, for I have an inward treasure born with me.`,

  // --- Poetry ---
  `Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth.`,
  `The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep, and miles to go before I sleep, before the quiet gathering of the silent snow.`,
  `Do not go gentle into that good night, old age should burn and rave at close of day; rage, rage against the dying of the light, though wise men at their end know dark is right.`,
  `Out of the night that covers me, black as the pit from pole to pole, I thank whatever gods may be for my unconquerable soul. I am the master of my fate, I am the captain of my soul.`,
  `If you can keep your head when all about you are losing theirs and blaming it on you, if you can trust yourself when all men doubt you, but make allowance for their doubting too.`,
  `My name is Ozymandias, king of kings: look on my works, ye mighty, and despair! Nothing beside remains. Round the decay of that colossal wreck, the lone and level sands stretch far away.`,
  `Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all, and sweetest in the gale is heard, and sore must be the storm.`,
  `Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore, while I nodded, nearly napping, suddenly there came a gentle tapping.`,
  `Though much is taken, much abides; and though we are not now that strength which in old days moved earth and heaven, that which we are, we are; one equal temper of heroic hearts.`,
  `I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you. I loafe and invite my soul, I lean and loafe at my ease.`,

  // --- Shakespeare ---
  `All the world's a stage, and all the men and women merely players; they have their exits and their entrances, and one man in his time plays many parts, his acts being seven ages.`,
  `To be, or not to be, that is the question: whether it is nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and end them.`,
  `Tomorrow, and tomorrow, and tomorrow, creeps in this petty pace from day to day, to the last syllable of recorded time; and all our yesterdays have lighted fools the way to dusty death.`,
  `Cowards die many times before their deaths; the valiant never taste of death but once. Of all the wonders that I yet have heard, it seems to me most strange that men should fear it.`,
  `The quality of mercy is not strained; it droppeth as the gentle rain from heaven upon the place beneath. It is twice blest: it blesseth him that gives and him that takes.`,
  `We few, we happy few, we band of brothers; for he today that sheds his blood with me shall be my brother, and gentlemen now abed shall think themselves accursed they were not here.`,
  `Our revels now are ended. These our actors, as I foretold you, were all spirits and are melted into air, into thin air; we are such stuff as dreams are made on, rounded with a sleep.`,
  `Shall I compare thee to a summer's day? Thou art more lovely and more temperate: rough winds do shake the darling buds of May, and summer's lease hath all too short a date.`,
  `But soft, what light through yonder window breaks? It is the east, and Juliet is the sun. Arise, fair sun, and kill the envious moon, who is already sick and pale with grief.`,
  `If music be the food of love, play on; give me excess of it, that, surfeiting, the appetite may sicken, and so die. That strain again, it had a dying fall, sweet as the wind.`,

  // --- Movie excerpts ---
  `I have seen things you people would not believe. Attack ships on fire off the shoulder of Orion. I watched C-beams glitter in the dark near the Tannhauser Gate. All those moments will be lost in time, like tears in rain.`,
  `You take the blue pill, the story ends, you wake up and believe whatever you want to believe. You take the red pill, you stay in Wonderland, and I show you how deep the rabbit hole goes.`,
  `It is not about how hard you hit. It is about how hard you can get hit and keep moving forward, how much you can take and keep moving forward. That is how winning is done.`,
  `I find I am so excited I can barely sit still or hold a thought in my head. I think it is the kind of excitement only a free man can feel at the start of a long journey whose conclusion is uncertain.`,
  `It is like in the great stories, the ones that really mattered. Full of darkness and danger they were, and sometimes you did not want to know the end, because how could the end be happy?`,
  `You either die a hero, or you live long enough to see yourself become the villain. I can do those things because I am not a hero. I am whatever this city needs me to be right now.`,
  `We do not read and write poetry because it is cute. We read and write poetry because we are members of the human race, and the human race is filled with passion, and poetry is what we stay alive for.`,
  `My mama always said life was like a box of chocolates. You never know what you are gonna get. She always had a way of explaining things so I could understand them, and I sure do miss her.`,
  `The point is, ladies and gentlemen, that greed, for lack of a better word, is good. Greed is right, greed works. Greed clarifies, cuts through, and captures the essence of the evolutionary spirit.`,
  `You want me on that wall, you need me on that wall. We use words like honor, code, and loyalty as the backbone of a life spent defending something. You use them only as a punchline.`,
  `My name is Maximus Decimus Meridius, commander of the armies of the North, loyal servant to the true emperor, father to a murdered son, husband to a murdered wife, and I will have my vengeance.`,
  `We have never lost an American in space, and we are sure as heck not gonna lose one on my watch. Failure is not an option. Let us work the problem, people, and not make it worse by guessing.`,
  `If you build it, he will come. Ease his pain. Go the distance. People will come, Ray. They will come to Iowa for reasons they cannot even fathom, and turn up your driveway not knowing for sure why.`,
  `They may take our lives, but they will never take our freedom. Fight and you may die. Run and you will live, at least a while, and would you trade all those years for one chance to come back here?`,
  `Your scientists were so preoccupied with whether or not they could that they did not stop to think if they should. The lack of humility before nature that is being displayed here staggers me.`,
  `The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men. Blessed is he who, in the name of charity, shepherds the weak through the valley.`,
  `I want you to get up right now and go to the window, open it, and stick your head out and yell, I am as mad as hell, and I am not going to take this anymore. Things have got to change.`,
  `Strange, is it not? Each man's life touches so many other lives, and when he is not around he leaves an awful hole. You see, George, you really had a wonderful life after all this time.`,
  `Fear is the path to the dark side. Fear leads to anger, anger leads to hate, and hate leads to suffering. Do or do not, there is no try. Once you start down the dark path it will dominate your destiny.`,
  `The Force is what gives a Jedi his power. It is an energy field created by all living things; it surrounds us and penetrates us, it binds the galaxy together. Trust your feelings and let go.`,

  // --- More wisdom & inspiration ---
  `It always seems impossible until it is done. A good head and a good heart are always a formidable combination, but when you add to that a literate tongue or pen, then you have something very special.`,
  `Be the change that you wish to see in the world. The weak can never forgive; forgiveness is the attribute of the strong. Live as if you were to die tomorrow, learn as if you were to live forever.`,
  `The important thing is not to stop questioning. Curiosity has its own reason for existing. One cannot help but be in awe when contemplating the mysteries of eternity, of life, of the structure of reality.`,
  `The future belongs to those who believe in the beauty of their dreams. No one can make you feel inferior without your consent. Do one thing every day that scares you, and you will surely grow.`,
  `Your time is limited, so do not waste it living someone else's life. Do not be trapped by dogma, which is living with the results of other people's thinking. Have the courage to follow your heart.`,
  `I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, rather than discover that I had not lived.`,
  `To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. What lies behind us and before us are tiny matters compared to what lies within us.`,
  `You have power over your mind, not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts, so guard them and take great care.`,
  `The journey of a thousand miles begins with a single step. When I let go of what I am, I become what I might be. Nature does not hurry, yet everything is accomplished in its own perfect time.`,
  `The best and most beautiful things in the world cannot be seen or even touched; they must be felt with the heart. Alone we can do so little; together we can do so much in this daring adventure.`,
  `I have learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel. Try to be a rainbow in someone else's cloud.`,
  `Twenty years from now you will be more disappointed by the things that you did not do than by the ones you did do. So throw off the bowlines, sail away from the safe harbor, and explore and dream.`,
  `We are what we repeatedly do. Excellence, then, is not an act, but a habit. Knowing yourself is the beginning of all wisdom, and the roots of education are bitter, but the fruit of it is sweet.`,
  `It does not matter how slowly you go as long as you do not stop. Our greatest glory is not in never falling, but in rising every time we fall. He who moves a mountain begins by carrying small stones.`,
  `He who has a why to live can bear almost any how. That which does not kill us makes us stronger, and those who were seen dancing were thought insane by those who could not hear the music.`,
  `Far better it is to dare mighty things, to win glorious triumphs even though checkered by failure, than to rank with those poor spirits who neither enjoy much nor suffer much in the gray twilight.`,
  `Somewhere, something incredible is waiting to be known. We are a way for the cosmos to know itself. The nitrogen in our DNA and the iron in our blood were made in the interiors of collapsing stars.`,
  `How wonderful it is that nobody need wait a single moment before starting to improve the world. In spite of everything, I still believe that people are really good at heart, despite the chaos.`,
  `Everything can be taken from a man but one thing: the last of the human freedoms, to choose one's attitude in any given set of circumstances, to choose one's own way, no matter the conditions.`,
  `The supreme art of war is to subdue the enemy without fighting. Appear weak when you are strong, and strong when you are weak. In the midst of chaos, there is also opportunity for the patient.`,

  // --- More movies & pop culture ---
  `Hello. My name is Inigo Montoya. You killed my father. Prepare to die. I have been in the revenge business so long that now it is over, I do not know what to do with the rest of my life.`,
  `Of all the gin joints in all the towns in all the world, she walks into mine. We will always have Paris. Here is looking at you, kid. The problems of three little people do not amount to much.`,
  `I feel the need, the need for speed. You do not have time to think up there; if you think, you are dead. It is not your flying, it is your attitude. The enemy is dangerous, but right now you are worse.`,
  `Toto, I have a feeling we are not in Kansas anymore. There is no place like home. Pay no attention to that man behind the curtain. And I will get you, my pretty, and your little dog too.`,
  `The future is not set. There is no fate but what we make for ourselves. If a machine can learn the value of human life, maybe we can too. I know now why you cry, but it is something I can never do.`,
  `You are gonna need a bigger boat. I will find him for three, but I will catch him and kill him for ten. For that you get the head, the tail, the whole thing. This shark will swallow you whole.`,
  `As far back as I can remember, I always wanted to be a gangster. To me, being a gangster was better than being president of the United States, even long before I first wandered into the cabstand.`,
  `You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. You are on your own, and you know what you know, and you decide where to go from here.`,
  `We are all in the gutter, but some of us are looking at the stars. Be yourself; everyone else is already taken. To live is the rarest thing in the world; most people merely exist, and that is all.`,
  `The world breaks everyone, and afterward many are strong at the broken places. But those that will not break, it kills. It kills the very good and the very gentle and the very brave impartially.`,
  `So we beat on, boats against the current, borne back ceaselessly into the past. Gatsby believed in the green light, the future that year by year recedes before us. It eluded us then, but no matter.`,
  `Why, sometimes I have believed as many as six impossible things before breakfast. We are all mad here. If you do not know where you are going, any road will get you there, said the grinning cat.`,
  `Go confidently in the direction of your dreams, and live the life you have imagined. As you simplify your life, the laws of the universe will be simpler, and solitude will not be solitude at all.`,
  `It is a dangerous business, going out your door. You step onto the road, and if you do not keep your feet, there is no knowing where you might be swept off to, for the road goes ever on and on.`,
  `That is one small step for man, one giant leap for mankind. Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind, and we go forward with hope for everyone.`,
  `All our dreams can come true if we have the courage to pursue them. The way to get started is to quit talking and begin doing. It is kind of fun to do the impossible, so keep moving forward always.`,
  `I am gonna make him an offer he cannot refuse. A man who does not spend time with his family can never be a real man. Great men are not born great, they grow great, and so it is with all of us.`,
  `Houston, we have a problem. There is no dark side of the moon, really; as a matter of fact, it is all dark. We choose to go to the moon not because it is easy, but because it is hard to do.`,
  `In spite of everything I shall rise again: I will take up my pencil, which I have forsaken in my great discouragement, and I will go on with my drawing. The way is long, but the heart is willing.`,
  `Life moves pretty fast. If you do not stop and look around once in a while, you could miss it. The question is not what are we going to do, but what are we not going to do with all this time.`,
]

// Returns `count` distinct quotes chosen at random for one game.
export function pickPassages(count: number): string[] {
  const pool = [...QUOTES]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}
