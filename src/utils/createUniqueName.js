// https://github.com/andreasonny83/unique-names-generator
// ...but filtered out long names to prevent wrapping

const adjectives = [
	'amber',
	'aqua',
	'azure',
	'beige',
	'black',
	'blue',
	'blush',
	'bronze',
	'brown',
	'coffee',
	'copper',
	'coral',
	'cyan',
	'gold',
	'gray',
	'green',
	'indigo',
	'ivory',
	'jade',
	'lime',
	'maroon',
	'olive',
	'orange',
	'peach',
	'pink',
	'plum',
	'purple',
	'red',
	'rose',
	'salmon',
	'silver',
	'tan',
	'teal',
	'tomato',
	'violet',
	'white',
	'yellow',
	'big',
	'fat',
	'giant',
	'great',
	'huge',
	'large',
	'little',
	'long',
	'petite',
	'puny',
	'short',
	'small',
	'tall',
	'tiny',
	'breezy',
	'broken',
	'bumpy',
	'chilly',
	'cold',
	'cool',
	'creepy',
	'cuddly',
	'curly',
	'damp',
	'dirty',
	'dry',
	'dusty',
	'filthy',
	'flaky',
	'fluffy',
	'wet',
	'broad',
	'chubby',
	'curved',
	'deep',
	'flat',
	'high',
	'hollow',
	'low',
	'narrow',
	'round',
	'skinny',
	'square',
	'steep',
	'wide',
	'brief',
	'early',
	'fast',
	'late',
	'long',
	'modern',
	'old',
	'quick',
	'rapid',
	'short',
	'slow',
	'swift',
	'young',
	'empty',
	'few',
	'heavy',
	'light',
	'many',
	'Sound',
	'cooing',
	'faint',
	'harsh',
	'hushed',
	'husky',
	'loud',
	'mute',
	'noisy',
	'quiet',
	'raspy',
	'shrill',
	'silent',
	'soft',
	'bitter',
	'fresh',
	'juicy',
	'ripe',
	'rotten',
	'salty',
	'sour',
	'spicy',
	'stale',
	'sticky',
	'strong',
	'sweet',
	'tasty',
	'fuzzy',
	'greasy',
	'grubby',
	'hard',
	'hot',
	'icy',
	'loose',
	'melted',
	'rainy',
	'rough',
	'shaggy',
	'shaky',
	'sharp',
	'silky',
	'slimy',
	'smooth',
	'soft',
	'solid',
	'steady',
	'sticky',
	'tender',
	'tight',
	'uneven',
	'weak',
	'wet',
	'wooden',
	'afraid',
	'angry',
	'awful',
	'bad',
	'bored',
	'creepy',
	'cruel',
	'eerie',
	'evil',
	'fierce',
	'hungry',
	'hurt',
	'ill',
	'lonely',
	'scary',
	'sore',
	'tense',
	'tired',
	'upset',
	'weary',
	'wicked',
	'amused',
	'brave',
	'calm',
	'eager',
	'elated',
	'fair',
	'fine',
	'funny',
	'gentle',
	'good',
	'happy',
	'jolly',
	'joyous',
	'kind',
	'lively',
	'lovely',
	'lucky',
	'proud',
	'silly',
	'witty',
	'zany',
	'other',
	'good',
	'new',
	'old',
	'great',
	'high',
	'small',
	'large',
	'local',
	'social',
	'long',
	'young',
	'right',
	'early',
	'big',
	'little',
	'able',
	'late',
	'full',
	'far',
	'low',
	'public',
	'bad',
	'main',
	'sure',
	'clear',
	'major',
	'only',
	'likely',
	'real',
	'black',
	'open',
	'whole',
	'white',
	'free',
	'short',
	'easy',
	'strong',
	'human',
	'common',
	'single',
	'hard',
	'poor',
	'wide',
	'simple',
	'recent',
	'close',
	'fine',
	'wrong',
	'royal',
	'nice',
	'french',
	'modern',
	'labour',
	'legal',
	'happy',
	'final',
	'red',
	'normal',
	'total',
	'prime',
	'sorry',
	'dead',
	'top',
	'soviet',
	'basic',
	'aware',
	'hon',
	'heavy',
	'direct',
	'dark',
	'cold',
	'ready',
	'green',
	'useful',
	'german',
	'deep',
	'left',
	'hot',
	'blue',
	'extra',
	'past',
	'male',
	'fair',
	'civil',
	'future',
	'senior',
	'annual',
	'huge',
	'rich',
	'safe',
	'key',
	'chief',
	'due',
	'active',
	'light',
	'warm',
	'middle',
	'fresh',
	'sexual',
	'front',
	'actual',
	'united',
	'cheap',
	'quiet',
	'soft',
	'quick',
	'very',
	'famous',
	'proper',
	'broad',
	'joint',
	'formal',
	'lovely',
	'usual',
	'ltd',
	'unable',
	'rural',
	'bright',
	'equal',
	'female',
	'afraid',
	'inc',
	'irish',
	'mental',
	'double',
	'slow',
	'tiny',
	'dry',
	'thin',
	'daily',
	'wild',
	'alone',
	'urban',
	'empty',
	'narrow',
	'upper',
	'tall',
	'busy',
	'bloody',
	'moral',
	'clean',
	'vital',
	'thick',
	'fast',
	'rare',
	'brief',
	'grand',
	'entire',
	'grey',
	'vast',
	'ideal',
	'funny',
	'minor',
	'severe',
	'ill',
	'weak',
	'brown',
	'odd',
	'inner',
	'used',
	'sharp',
	'sick',
	'near',
	'roman',
	'unique',
	'angry',
	'alive',
	'guilty',
	'lucky',
	'well',
	'yellow',
	'net',
	'tough',
	'dear',
	'glad',
	'tired',
	'sudden',
	'slight',
	'golden',
	'keen',
	'flat',
	'silent',
	'indian',
	'pale',
	'welsh',
	'firm',
	'wet',
	'armed',
	'living',
	'pure',
	'global',
	'sad',
	'secret',
	'rapid',
	'fixed',
	'sweet',
	'wooden',
	'solid',
	'rough',
	'mere',
	'mass',
	'tory',
	'visual',
	'cool',
	'stupid',
	'fit',
	'proud',
	'mad',
	'given',
	'awful',
	'stable',
	'holy',
	'smooth',
	'remote',
	'pink',
	'pretty',
	'honest',
	'plain',
	'still',
	'greek',
	'gentle',
	'broken',
	'live',
	'silly',
	'fat',
	'tight',
	'round',
	'junior',
	'dirty',
	'deaf',
	'above',
	'blind',
	'mean',
	'loose',
	'fellow',
	'square',
	'steady',
	'level',
	'lost',
	'clever',
	'raw',
	'asleep',
	'outer',
	'bitter',
	'native',
	'strict',
	'wise',
	'ethnic',
	'bare',
	'modest',
	'dutch',
	'acute',
	'valid',
	'weekly',
	'gross',
	'loud',
	'mutual',
	'liable',
	'ruling',
	'arab',
	'sole',
	'jewish',
	'latin',
	'nearby',
	'exact',
	'urgent',
	'oral',
	'marked',
	'superb',
	'sheer',
	'naked',
	'closed',
	'marine',
	'retail',
	'mixed',
	'known',
	'unfair',
	'spare',
	'asian',
	'hungry',
	'nasty',
	'just',
	'faint',
	'back',
	'decent',
	'flying',
	'random',
	'dull',
	'neat',
	'crazy',
	'damp',
	'giant',
	'secure',
	'bottom',
	'subtle',
	'brave',
	'lesser',
	'steep',
	'casual',
	'lonely',
	'upset',
	'mild',
	'iraqi',
	'okay',
	'harsh',
	'fierce',
	'magic',
	'fun',
	'kind',
	'gay',
	'smart',
	'drunk',
	'like',
	'boring',
	'super',
	'stiff',
	'lively',
	'mature',
	'evil',
	'verbal',
	'head',
	'vague',
	'naval',
	'shared',
	'added',
	'mid',
	'blank',
	'absent',
	'polish',
	'rigid',
	'cruel',
	'racial',
	'ugly',
	'swiss',
	'crude',
	'eager',
	'bold',
	'allied',
	'bored',
	'mobile',
	'orange',
	'rear',
	'fatal',
	'calm',
	'rival',
	'loyal',
	'noble',
	'linear',
	'fiscal',
	'awake',
	'varied',
	'sacred',
	'tender',
	'hidden',
	'worthy',
	'sound',
	'slim',
	'divine',
	'stuck',
	'liquid',
	'solar',
	'manual',
	'intact',
	'prior',
	'tragic',
	'toxic',
	'select',
	'then',
	'fond',
	'inland',
	'polite',
	'scared',
	'gothic',
	'korean',
	'static',
	'costly',
	'causal',
	'wee',
	'dual',
	'ok',
	'exotic',
	'purple',
	'dying',
	'grim',
	'atomic',
	'frozen',
	'wicked',
	'rising',
	'shy',
	'novel',
	'weird',
	'noisy',
	'coming',
	'excess',
	'rubber',
	'chosen',
	'agreed',
	'mighty',
	'sunny',
	'eldest',
	'vivid',
	'rude',
	'civic',
	'alive',
	'brainy',
	'busy',
	'clever',
	'crazy',
	'dead',
	'easy',
	'famous',
	'modern',
	'open',
	'poor',
	'real',
	'rich',
	'shy',
	'sleepy',
	'stupid',
	'super',
	'tame',
	'wild',
	'wrong',
	'alert',
	'blonde',
	'bloody',
	'bright',
	'clean',
	'clear',
	'cloudy',
	'cute',
	'dark',
	'drab',
	'dull',
	'fancy',
	'filthy',
	'homely',
	'light',
	'misty',
	'muddy',
	'plain',
	'poised',
	'quaint',
	'shiny',
	'smoggy',
	'stormy',
	'ugly',
	'bad',
	'better',
	'big',
	'black',
	'blue',
	'bright',
	'clumsy',
	'crazy',
	'dizzy',
	'dull',
	'fat',
	'frail',
	'funny',
	'great',
	'green',
	'grumpy',
	'happy',
	'itchy',
	'jolly',
	'kind',
	'long',
	'lazy',
	'many',
	'mighty',
	'mushy',
	'nasty',
	'new',
	'nice',
	'nosy',
	'nutty',
	'odd',
	'orange',
	'pretty',
	'purple',
	'quaint',
	'quiet',
	'quick',
	'rainy',
	'rare',
	'ratty',
	'red',
	'robust',
	'round',
	'sad',
	'scary',
	'short',
	'silly',
	'stingy',
	'spotty',
	'tart',
	'tall',
	'tame',
	'tan',
	'tender',
	'testy',
	'tricky',
	'tough',
	'ugly',
	'vast',
	'watery',
	'yellow',
	'yummy',
	'zany'
];
const animals = [
	'cat',
	'cattle',
	'dog',
	'donkey',
	'goat',
	'horse',
	'pig',
	'rabbit',
	'alpaca',
	'ant',
	'ape',
	'aphid',
	'asp',
	'baboon',
	'badger',
	'bass',
	'bat',
	'bear',
	'beaver',
	'bedbug',
	'bee',
	'beetle',
	'bird',
	'bison',
	'boa',
	'boar',
	'bobcat',
	'bonobo',
	'booby',
	'bovid',
	'bug',
	'camel',
	'canid',
	'carp',
	'cat',
	'cattle',
	'clam',
	'cobra',
	'cod',
	'condor',
	'coral',
	'cougar',
	'cow',
	'coyote',
	'crab',
	'crane',
	'crow',
	'cuckoo',
	'cicada',
	'deer',
	'dingo',
	'dog',
	'donkey',
	'dove',
	'dragon',
	'duck',
	'eagle',
	'earwig',
	'eel',
	'egret',
	'elk',
	'emu',
	'ermine',
	'falcon',
	'ferret',
	'finch',
	'fish',
	'flea',
	'fly',
	'fowl',
	'fox',
	'frog',
	'gecko',
	'gerbil',
	'gibbon',
	'goat',
	'goose',
	'gopher',
	'grouse',
	'guan',
	'gull',
	'guppy',
	'hare',
	'hawk',
	'heron',
	'hornet',
	'horse',
	'hyena',
	'iguana',
	'impala',
	'jackal',
	'jaguar',
	'jay',
	'kite',
	'kiwi',
	'koala',
	'koi',
	'krill',
	'lark',
	'leech',
	'lemur',
	'leopon',
	'limpet',
	'lion',
	'lizard',
	'llama',
	'locust',
	'loon',
	'louse',
	'lynx',
	'macaw',
	'magpie',
	'mammal',
	'marlin',
	'marmot',
	'marten',
	'mink',
	'minnow',
	'mite',
	'mole',
	'monkey',
	'moose',
	'moth',
	'mouse',
	'mule',
	'muskox',
	'newt',
	'ocelot',
	'orca',
	'otter',
	'owl',
	'ox',
	'panda',
	'parrot',
	'perch',
	'pig',
	'pigeon',
	'pike',
	'pony',
	'possum',
	'prawn',
	'puffin',
	'puma',
	'python',
	'quail',
	'quelea',
	'quokka',
	'rabbit',
	'rat',
	'raven',
	'rodent',
	'rook',
	'salmon',
	'shark',
	'sheep',
	'shrew',
	'shrimp',
	'skink',
	'skunk',
	'sloth',
	'slug',
	'smelt',
	'snail',
	'snake',
	'snipe',
	'sole',
	'spider',
	'squid',
	'stoat',
	'stork',
	'swan',
	'swift',
	'tahr',
	'takin',
	'tapir',
	'tern',
	'thrush',
	'tick',
	'tiger',
	'tiglon',
	'toad',
	'toucan',
	'trout',
	'tuna',
	'turkey',
	'turtle',
	'urial',
	'vicuna',
	'viper',
	'vole',
	'walrus',
	'wasp',
	'weasel',
	'whale',
	'wolf',
	'wombat',
	'worm',
	'wren',
	'yak',
	'zebra',
	'alpaca',
	'cat',
	'cattle',
	'dog',
	'donkey',
	'ferret',
	'gayal',
	'guppy',
	'horse',
	'koi',
	'llama',
	'sheep',
	'yak'
];

const ent = arr => arr[Math.floor(Math.random() * arr.length)];

export default (separator = '-') => `${ent(adjectives)}${separator}${ent(animals)}`;
