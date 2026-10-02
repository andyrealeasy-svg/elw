import { StoryChapter } from '../types';

export const CHAPTER_1: StoryChapter = {
  id: "chap1",
  title: "Глава I: Мир, которого не было",
  subtitle: "DIFFERENT DIMENSION",
  description: "Обычная дорога превращается в цепочку пространственных аномалий и сбоев реальности. Мир пытается удалить ошибку и перезапуститься...",
  stages: [
    {
      id: "s1_1",
      name: "1. Начало пути",
      description: "Обычная дорога становится первым признаком того, что мир ведёт себя неправильно.",
      type: 'DIALOGUE',
      level: 10,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Если карта не врёт, до следующего поселения осталось около часа." },
        { speaker: "Копро", charId: "kopro", text: "Ты это уже говорил." },
        { speaker: "Мо Янь", charId: "moyan", text: "Я говорил это пять минут назад." },
        { speaker: "Копро", charId: "kopro", text: "Нет. Минут двадцать." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты засекал?" },
        { speaker: "Копро", charId: "kopro", text: "Нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда откуда ты знаешь?" },
        { speaker: "Копро", charId: "kopro", text: "Не знаю. Просто помню." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ладно. Это немного странно." },
        { speaker: "Копро", charId: "kopro", text: "Наконец-то ты это признал." },
        { speaker: "Мо Янь", charId: "moyan", text: "Я признал только то, что ты странный." },
        { speaker: "Копро", charId: "kopro", text: "И это уже прогресс." },
        { speaker: "Мо Янь", charId: "moyan", text: "Пойдём. Если продолжим стоять, ты ещё начнёшь утверждать, что мы здесь уже были." },
        { speaker: "Копро", charId: "kopro", text: "Мы здесь уже были." },
        { speaker: "Мо Янь", charId: "moyan", text: "..." },
        { speaker: "Копро", charId: "kopro", text: "Вот именно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда покажи, где." },
        { speaker: "Копро", charId: "kopro", text: "Я не могу." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему?" },
        { speaker: "Копро", charId: "kopro", text: "Потому что место, которое я помню, выглядело иначе." }
      ],
      reward: { gems: 50, gold: 5000, exp: 2000 }
    },
    {
      id: "s1_2",
      name: "2. Знак на дереве",
      description: "На дереве найден знак, который Копро уже видел. Решить последовательность символов и открыть проход.",
      type: 'RIDDLE',
      level: 10,
      riddle: {
        question: "Четыре камня показывают: круг → треугольник → круг → ?. Какая форма должна продолжить зашифрованный цикл?",
        options: ["Квадрат", "Треугольник", "Круг", "Звезда"],
        correctIndex: 1,
        hint: "Посмотри не на форму, а на повторение."
      },
      reward: { gems: 50, gold: 5000 }
    },
    {
      id: "s1_3",
      name: "3. Тлеющая поляна",
      description: "Обычная встреча с врагами заканчивается совсем не обычно. Победить всех противников.",
      type: 'BATTLE',
      enemyBlueprintIds: ['gaia', 'blaze'],
      level: 12,
      reward: { gems: 60, gold: 8000, exp: 3000 }
    },
    {
      id: "s1_4",
      name: "4. След, которого нет",
      description: "Исчезновение врага оставляет больше вопросов, чем ответов. Осмотреть место исчезновения.",
      type: 'DIALOGUE',
      level: 12,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Вот здесь он стоял." },
        { speaker: "Мо Янь", charId: "moyan", text: "Здесь ничего нет." },
        { speaker: "Копро", charId: "kopro", text: "Я вижу следы." },
        { speaker: "Мо Янь", charId: "moyan", text: "Следы есть. Но они заканчиваются посреди земли." },
        { speaker: "Копро", charId: "kopro", text: "Именно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Может, он просто ушёл?" },
        { speaker: "Копро", charId: "kopro", text: "Куда?" },
        { speaker: "Мо Янь", charId: "moyan", text: "Не знаю." },
        { speaker: "Копро", charId: "kopro", text: "Тогда почему ты говоришь так, будто знаешь?" },
        { speaker: "Мо Янь", charId: "moyan", text: "Потому что мне не нравится вариант, в котором он просто исчез." },
        { speaker: "Копро", charId: "kopro", text: "Мне тоже." },
        { speaker: "Мо Янь", charId: "moyan", text: "И ещё меньше мне нравится то, что я начинаю тебе верить." },
        { speaker: "Копро", charId: "kopro", text: "Запомни этот момент. Такое бывает редко." }
      ],
      reward: { gems: 50, gold: 6000, exp: 2500 }
    },
    {
      id: "s1_5",
      name: "5. Незнакомец",
      description: "Таинственный Ашер предупреждает вас не идти дальше. Завершить разговор с Ашером.",
      type: 'DIALOGUE',
      level: 13,
      dialogue: [
        { speaker: "Ашер", charId: "asher", text: "Вы заблудились?" },
        { speaker: "Мо Янь", charId: "moyan", text: "Нет. А что?" },
        { speaker: "Ашер", charId: "asher", text: "Тогда почему вы идёте по дороге, которой здесь никогда не было?" },
        { speaker: "Копро", charId: "kopro", text: "Что?" },
        { speaker: "Ашер", charId: "asher", text: "Эта дорога появилась сегодня утром." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты хочешь сказать, что её вчера не существовало?" },
        { speaker: "Ашер", charId: "asher", text: "Я хочу сказать, что ещё час назад её не существовало." },
        { speaker: "Копро", charId: "kopro", text: "Мы шли по ней дольше часа." },
        { speaker: "Ашер", charId: "asher", text: "..." },
        { speaker: "Мо Янь", charId: "moyan", text: "Теперь ты выглядишь обеспокоенным." },
        { speaker: "Ашер", charId: "asher", text: "Потому что я обеспокоен." },
        { speaker: "Копро", charId: "kopro", text: "Кто ты вообще?" },
        { speaker: "Ашер", charId: "asher", text: "Человек, который советует вам развернуться." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему?" },
        { speaker: "Ашер", charId: "asher", text: "Потому что дальше становится хуже." },
        { speaker: "Копро", charId: "kopro", text: "А если мы не развернёмся?" },
        { speaker: "Ашер", charId: "asher", text: "Тогда, возможно, я встречу вас снова." },
        { speaker: "Мо Янь", charId: "moyan", text: "Возможно?" },
        { speaker: "Ашер", charId: "asher", text: "Если эта версия вас доживёт до встречи." }
      ],
      reward: { gems: 60, gold: 8000, exp: 3000 }
    },
    {
      id: "s1_6",
      name: "6. Тревога",
      description: "Неизвестные существа появляются после встречи с Ашером. Победить противников.",
      type: 'BATTLE',
      enemyBlueprintIds: ['blaze', 'viper'],
      level: 14,
      reward: { gems: 70, gold: 10000, exp: 4000 }
    },
    {
      id: "s1_7",
      name: "7. Граница",
      description: "Древняя дверь показывает каждому свою версию надписи. Решить загадку двери.",
      type: 'RIDDLE',
      level: 14,
      riddle: {
        question: "На двери четыре символа и фрагменты древнего завета. Выберите правильный порядок активации рун:",
        options: [
          "Круг → Круг → Треугольник → Треугольник",
          "Круг → Треугольник → Круг → Треугольник",
          "Треугольник → Круг → Треугольник → Круг",
          "Квадрат → Круг → Квадрат → Круг"
        ],
        correctIndex: 1,
        hint: "Правильная последовательность повторяет мотив первой загадки."
      },
      reward: { gems: 70, gold: 8000 }
    },
    {
      id: "s1_8",
      name: "8. Сбой",
      description: "Вы оказываетесь в другом месте, не сделав ни шага. Завершить сцену сбоя.",
      type: 'DIALOGUE',
      level: 15,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Копро." },
        { speaker: "Копро", charId: "kopro", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы только что были перед дверью." },
        { speaker: "Копро", charId: "kopro", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему мы стоим здесь?" },
        { speaker: "Копро", charId: "kopro", text: "Не знаю." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты что-нибудь помнишь?" },
        { speaker: "Копро", charId: "kopro", text: "Я помню, как мы вошли." },
        { speaker: "Мо Янь", charId: "moyan", text: "А потом?" },
        { speaker: "Копро", charId: "kopro", text: "А потом..." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что?" },
        { speaker: "Копро", charId: "kopro", text: "Ничего." },
        { speaker: "Мо Янь", charId: "moyan", text: "В смысле?" },
        { speaker: "Копро", charId: "kopro", text: "Между двумя моментами ничего не было. Как будто там нет времени." },
        { speaker: "Неизвестный голос", charId: "neuron", text: "Потому что ничего и не было." },
        { speaker: "Мо Янь", charId: "moyan", text: "Кто здесь?" },
        { speaker: "Нейрон", charId: "neuron", text: "Вы слишком рано начали замечать." }
      ],
      reward: { gems: 80, gold: 10000, exp: 5000 }
    },
    {
      id: "s1_9",
      name: "9. Нейрон",
      description: "Странный незнакомец знает о вас больше, чем должен. Завершить первую встречу с Нейроном.",
      type: 'DIALOGUE',
      level: 15,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Мы знакомы?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Тогда откуда ты знаешь моё имя?" },
        { speaker: "Нейрон", charId: "neuron", text: "Ты уже говорил его." },
        { speaker: "Копро", charId: "kopro", text: "Когда?" },
        { speaker: "Нейрон", charId: "neuron", text: "В прошлый раз." },
        { speaker: "Мо Янь", charId: "moyan", text: "Какой ещё прошлый раз?" },
        { speaker: "Нейрон", charId: "neuron", text: "Предыдущий." },
        { speaker: "Мо Янь", charId: "moyan", text: "Предыдущий чему?" },
        { speaker: "Нейрон", charId: "neuron", text: "Этой сцене." },
        { speaker: "Копро", charId: "kopro", text: "Ты сейчас издеваешься над нами?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда объясни нормально." },
        { speaker: "Нейрон", charId: "neuron", text: "Я пытаюсь." },
        { speaker: "Мо Янь", charId: "moyan", text: "И?" },
        { speaker: "Нейрон", charId: "neuron", text: "Не получается." },
        { speaker: "Копро", charId: "kopro", text: "Почему?" },
        { speaker: "Нейрон", charId: "neuron", text: "Потому что вы ещё не должны это слышать." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что именно?" },
        { speaker: "Нейрон", charId: "neuron", text: "То, что я сейчас скажу." },
        { speaker: "Нейрон", charId: "neuron", text: "Уходите отсюда." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему?" },
        { speaker: "Нейрон", charId: "neuron", text: "Потому что они уже заметили вас." }
      ],
      reward: { gems: 80, gold: 10000, exp: 5000 }
    },
    {
      id: "s1_10",
      name: "10. Импульс",
      description: "Нейрон предсказывает появление врагов. Победить противников.",
      type: 'BATTLE',
      enemyBlueprintIds: ['glacier', 'blaze', 'viper'],
      level: 16,
      reward: { gems: 90, gold: 12000, exp: 6000 }
    },
    {
      id: "s1_11",
      name: "11. Старая станция",
      description: "Копро узнаёт место, в котором никогда не был. Осмотреть станцию.",
      type: 'DIALOGUE',
      level: 17,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Странно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что теперь?" },
        { speaker: "Копро", charId: "kopro", text: "Я знаю это место." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты говорил, что никогда здесь не был." },
        { speaker: "Копро", charId: "kopro", text: "Я знаю." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда откуда?" },
        { speaker: "Копро", charId: "kopro", text: "Не знаю." },
        { speaker: "Мо Янь", charId: "moyan", text: "Копро." },
        { speaker: "Копро", charId: "kopro", text: "Я помню дверь справа." },
        { speaker: "Мо Янь", charId: "moyan", text: "Там нет двери." },
        { speaker: "Копро", charId: "kopro", text: "Она была красной." },
        { speaker: "Мо Янь", charId: "moyan", text: "Здесь вообще ничего красного." },
        { speaker: "Копро", charId: "kopro", text: "Я начинаю думать, что проблема не в месте." },
        { speaker: "Мо Янь", charId: "moyan", text: "А в чём?" },
        { speaker: "Копро", charId: "kopro", text: "В нас." }
      ],
      reward: { gems: 80, gold: 10000, exp: 5000 }
    },
    {
      id: "s1_12",
      name: "12. Дом",
      description: "В старом доме находится невозможная фотография. Решить загадку расположения предметов.",
      type: 'RIDDLE',
      level: 17,
      riddle: {
        question: "Расположите найденные артефакты в временном порядке хронологии, чтобы открыть потайной ящик:",
        options: [
          "Фотография → Ключ → Записка → Пустая рамка",
          "Записка → Ключ → Пустая рамка → Фотография",
          "Пустая рамка → Записка → Ключ → Фотография",
          "Ключ → Записка → Фотография → Пустая рамка"
        ],
        correctIndex: 0,
        hint: "Внутри скрыта фотография Мо Яня и Копро с датой, когда они ещё не были знакомы."
      },
      reward: { gems: 100, gold: 12000 }
    },
    {
      id: "s1_13",
      name: "13. Не открывай",
      description: "Сельва знает, что означает найденная фотография. Поговорить с Сельвой.",
      type: 'DIALOGUE',
      level: 18,
      dialogue: [
        { speaker: "Сельва", charId: "selva", text: "Закройте ящик." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему?" },
        { speaker: "Сельва", charId: "selva", text: "Потому что вы уже увидели достаточно." },
        { speaker: "Копро", charId: "kopro", text: "Ты знаешь, что это?" },
        { speaker: "Сельва", charId: "selva", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что на фотографии?" },
        { speaker: "Сельва", charId: "selva", text: "Версия событий, которой больше не существует." },
        { speaker: "Копро", charId: "kopro", text: "Я на ней." },
        { speaker: "Сельва", charId: "selva", text: "Да." },
        { speaker: "Копро", charId: "kopro", text: "И Мо Янь." },
        { speaker: "Сельва", charId: "selva", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы встречались раньше?" },
        { speaker: "Сельва", charId: "selva", text: "Возможно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты можешь ответить нормально?" },
        { speaker: "Сельва", charId: "selva", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Почему?" },
        { speaker: "Сельва", charId: "selva", text: "Потому что нормального ответа здесь больше нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что с этим миром происходит?" },
        { speaker: "Сельва", charId: "selva", text: "Он пытается вспомнить, каким должен быть." },
        { speaker: "Копро", charId: "kopro", text: "А если он вспомнит?" },
        { speaker: "Сельва", charId: "selva", text: "Тогда вы можете исчезнуть." }
      ],
      reward: { gems: 100, gold: 15000, exp: 7000 }
    },
    {
      id: "s1_14",
      name: "14. Сельва",
      description: "Впервые звучит история о предыдущих версиях мира. Узнать о трёх предыдущих перезапусках.",
      type: 'DIALOGUE',
      level: 18,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Сколько раз это уже случалось?" },
        { speaker: "Сельва", charId: "selva", text: "Трижды." },
        { speaker: "Копро", charId: "kopro", text: "Трижды мир ломался?" },
        { speaker: "Сельва", charId: "selva", text: "Трижды мир исправлял себя." },
        { speaker: "Мо Янь", charId: "moyan", text: "Разница?" },
        { speaker: "Сельва", charId: "selva", text: "Очень большая." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что происходило после исправления?" },
        { speaker: "Сельва", charId: "selva", text: "Люди забывали." },
        { speaker: "Копро", charId: "kopro", text: "Все?" },
        { speaker: "Сельва", charId: "selva", text: "Почти." },
        { speaker: "Мо Янь", charId: "moyan", text: "А ты?" },
        { speaker: "Сельва", charId: "selva", text: "Я помнила." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему?" },
        { speaker: "Сельва", charId: "selva", text: "Не знаю." },
        { speaker: "Копро", charId: "kopro", text: "И что было в прошлый раз?" },
        { speaker: "Сельва", charId: "selva", text: "Вы дошли до центра." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы?" },
        { speaker: "Сельва", charId: "selva", text: "Не вы." },
        { speaker: "Копро", charId: "kopro", text: "Тогда кто?" },
        { speaker: "Сельва", charId: "selva", text: "Люди, которые выглядели точно так же, как вы." },
        { speaker: "Мо Янь", charId: "moyan", text: "И что они сделали?" },
        { speaker: "Сельва", charId: "selva", text: "Они спросили то же самое." },
        { speaker: "Копро", charId: "kopro", text: "И ты ответила?" },
        { speaker: "Сельва", charId: "selva", text: "В прошлый раз — да." },
        { speaker: "Копро", charId: "kopro", text: "А сейчас?" },
        { speaker: "Сельва", charId: "selva", text: "Сейчас я надеюсь, что вы не спросите." }
      ],
      reward: { gems: 100, gold: 15000, exp: 7000 }
    },
    {
      id: "s1_15",
      name: "15. Стирание",
      description: "Сам мир начинает сопротивляться вашему присутствию. Защитить Сельву и пережить стирание.",
      type: 'BATTLE',
      enemyBlueprintIds: ['blaze', 'gaia', 'aegis'],
      level: 19,
      reward: { gems: 120, gold: 18000, exp: 8000 }
    },
    {
      id: "s1_16",
      name: "16. Человек, которого нет",
      description: "Вы находите имя того, кого никогда не существовало. Завершить разговор.",
      type: 'DIALOGUE',
      level: 20,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Здесь написано имя." },
        { speaker: "Мо Янь", charId: "moyan", text: "Кто это?" },
        { speaker: "Сельва", charId: "selva", text: "Он должен был быть здесь." },
        { speaker: "Мо Янь", charId: "moyan", text: "Но его нет." },
        { speaker: "Сельва", charId: "selva", text: "Да." },
        { speaker: "Нейрон", charId: "neuron", text: "Он есть." },
        { speaker: "Копро", charId: "kopro", text: "Где?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нигде." },
        { speaker: "Мо Янь", charId: "moyan", text: "Это вообще возможно?" },
        { speaker: "Нейрон", charId: "neuron", text: "В этой версии — нет." },
        { speaker: "Сельва", charId: "selva", text: "Он был стёрт." },
        { speaker: "Копро", charId: "kopro", text: "Ты говоришь о человеке так, будто это файл." },
        { speaker: "Нейрон", charId: "neuron", text: "Для мира разницы нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "А для нас?" },
        { speaker: "Нейрон", charId: "neuron", text: "Для вас — есть." },
        { speaker: "Копро", charId: "kopro", text: "Почему?" },
        { speaker: "Нейрон", charId: "neuron", text: "Потому что вы начали это замечать." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что именно?" },
        { speaker: "Нейрон", charId: "neuron", text: "То, что реальность не является единственной." }
      ],
      reward: { gems: 120, gold: 18000, exp: 8000 }
    },
    {
      id: "s1_17",
      name: "17. Охота",
      description: "Ашер больше не предупреждает вас — он нападает. Выдержать бой.",
      type: 'BATTLE',
      enemyBlueprintIds: ['blaze', 'asher'],
      level: 21,
      reward: { gems: 130, gold: 20000, exp: 9000 }
    },
    {
      id: "s1_18",
      name: "18. Испытание Ашера",
      description: "Первый настоящий бой с человеком, который знает слишком много. Победить Ашера.",
      type: 'BATTLE',
      isBoss: true,
      enemyBlueprintIds: ['blaze', 'asher', 'aegis'],
      level: 22,
      reward: { gems: 200, gold: 30000, exp: 12000 }
    },
    {
      id: "s1_19",
      name: "19. Правда Ашера",
      description: "Ашер раскрывает, кем были предыдущие версии героев. Узнать правду.",
      type: 'DIALOGUE',
      level: 22,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Ты проиграл." },
        { speaker: "Ашер", charId: "asher", text: "Да." },
        { speaker: "Копро", charId: "kopro", text: "Тогда почему ты не злишься?" },
        { speaker: "Ашер", charId: "asher", text: "Потому что бой не был моей целью." },
        { speaker: "Мо Янь", charId: "moyan", text: "А что было целью?" },
        { speaker: "Ашер", charId: "asher", text: "Не дать вам дойти до центра." },
        { speaker: "Копро", charId: "kopro", text: "Почему?" },
        { speaker: "Ашер", charId: "asher", text: "Потому что там вы уже были." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы только сегодня встретились." },
        { speaker: "Ашер", charId: "asher", text: "Вы — да." },
        { speaker: "Копро", charId: "kopro", text: "Ты опять говоришь загадками." },
        { speaker: "Ашер", charId: "asher", text: "Потому что прямой ответ вам не понравится." },
        { speaker: "Мо Янь", charId: "moyan", text: "Попробуй." },
        { speaker: "Ашер", charId: "asher", text: "В прошлой версии мира два человека дошли до центра." },
        { speaker: "Копро", charId: "kopro", text: "И кто они?" },
        { speaker: "Ашер", charId: "asher", text: "Мо Янь и Копро." },
        { speaker: "Мо Янь", charId: "moyan", text: "..." },
        { speaker: "Ашер", charId: "asher", text: "Они сделали то, что собираетесь сделать вы." },
        { speaker: "Копро", charId: "kopro", text: "Что?" },
        { speaker: "Ашер", charId: "asher", text: "Они попытались узнать, почему этот мир существует." },
        { speaker: "Мо Янь", charId: "moyan", text: "И?" },
        { speaker: "Ашер", charId: "asher", text: "Мир не пережил их вопрос." },
        { speaker: "Копро", charId: "kopro", text: "Что с ними стало?" },
        { speaker: "Ашер", charId: "asher", text: "Именно поэтому я сказал «вы» и «они» отдельно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты считаешь, что мы — не те же люди?" },
        { speaker: "Ашер", charId: "asher", text: "Я считаю, что пока не знаю, кто вы." },
        { speaker: "Копро", charId: "kopro", text: "А ты знаешь, кто такой Нейрон?" },
        { speaker: "Ашер", charId: "asher", text: "..." },
        { speaker: "Мо Янь", charId: "moyan", text: "Вот теперь ты испугался." },
        { speaker: "Ашер", charId: "asher", text: "Не произносите его имя возле центра." }
      ],
      reward: { gems: 150, gold: 22000, exp: 10000 }
    },
    {
      id: "s1_20",
      name: "20. Путь назад",
      description: "Дорога к центру превращается в борьбу с самой реальностью. Пробиться к центру.",
      type: 'BATTLE',
      enemyBlueprintIds: ['viper', 'glacier', 'blaze'],
      level: 23,
      reward: { gems: 150, gold: 22000, exp: 10000 }
    },
    {
      id: "s1_21",
      name: "21. Комната",
      description: "Устройство требует отсутствующий пятый элемент. Решить загадку устройства.",
      type: 'RIDDLE',
      level: 24,
      riddle: {
        question: "Четыре символа соответствуют персонажам. Введите порядок их появления в этой версии бытия:",
        options: [
          "Мо Янь → Копро → Ашер → Сельва",
          "Копро → Мо Янь → Сельва → Ашер",
          "Сельва → Ашер → Мо Янь → Копро",
          "Ашер → Мо Янь → Копро → Сельва"
        ],
        correctIndex: 0,
        hint: "Порядок появления персонажей в истории: Мо Янь и Копро, затем Ашер, затем Сельва."
      },
      reward: { gems: 150, gold: 20000 }
    },
    {
      id: "s1_22",
      name: "22. Пятый",
      description: "Нейрон впервые обращается не к героям, а к наблюдателю. Завершить мета-сцену.",
      type: 'DIALOGUE',
      level: 24,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Что значит «пятый наблюдатель»?" },
        { speaker: "Нейрон", charId: "neuron", text: "Это значит, что здесь не хватает одного человека." },
        { speaker: "Копро", charId: "kopro", text: "Кого?" },
        { speaker: "Нейрон", charId: "neuron", text: "Не человека." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда кого?" },
        { speaker: "Нейрон", charId: "neuron", text: "Того, кто всё это видит." },
        { speaker: "Копро", charId: "kopro", text: "Ты?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "Сельва?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Ашер?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда кто?" },
        { speaker: "Нейрон", charId: "neuron", text: "Вы знаете." },
        { speaker: "Копро", charId: "kopro", text: "Я не понимаю." },
        { speaker: "Нейрон", charId: "neuron", text: "Понимаете." },
        { speaker: "Мо Янь", charId: "moyan", text: "Нейрон, на кого ты смотришь?" },
        { speaker: "Нейрон", charId: "neuron", text: "Не на вас." },
        { speaker: "Копро", charId: "kopro", text: "Тогда на кого?" },
        { speaker: "Нейрон", charId: "neuron", text: "На того, кто нажимает «Далее»." },
        { speaker: "Мо Янь", charId: "moyan", text: "..." },
        { speaker: "Нейрон", charId: "neuron", text: "Теперь он знает, что мы его заметили." }
      ],
      reward: { gems: 180, gold: 25000, exp: 12000 }
    },
    {
      id: "s1_23",
      name: "23. Разлом",
      description: "Разные версии мира начинают существовать одновременно. Пережить разлом.",
      type: 'BATTLE',
      enemyBlueprintIds: ['blaze', 'glacier', 'gaia', 'viper'],
      level: 25,
      reward: { gems: 180, gold: 25000, exp: 12000 }
    },
    {
      id: "s1_24",
      name: "24. Последняя версия",
      description: "Все главные герои узнают цену перезапуска. Понять, что именно пытается исправить мир.",
      type: 'DIALOGUE',
      level: 25,
      dialogue: [
        { speaker: "Ашер", charId: "asher", text: "Я предупреждал вас." },
        { speaker: "Копро", charId: "kopro", text: "А мы не послушали." },
        { speaker: "Ашер", charId: "asher", text: "Я заметил." },
        { speaker: "Сельва", charId: "selva", text: "Пора заканчивать." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты знаешь, что происходит?" },
        { speaker: "Сельва", charId: "selva", text: "Теперь — да." },
        { speaker: "Копро", charId: "kopro", text: "А раньше?" },
        { speaker: "Сельва", charId: "selva", text: "Раньше я только помнила последствия." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда скажи." },
        { speaker: "Сельва", charId: "selva", text: "Каждый раз мир создавал новую версию себя." },
        { speaker: "Копро", charId: "kopro", text: "Зачем?" },
        { speaker: "Сельва", charId: "selva", text: "Чтобы удалить ошибку." },
        { speaker: "Мо Янь", charId: "moyan", text: "Какую?" },
        { speaker: "Сельва", charId: "selva", text: "Нас." },
        { speaker: "Копро", charId: "kopro", text: "Но мы существует." },
        { speaker: "Сельва", charId: "selva", text: "Именно поэтому эта версия нестабильна." },
        { speaker: "Нейрон", charId: "neuron", text: "Ошибка не в вас." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда в чём?" },
        { speaker: "Нейрон", charId: "neuron", text: "В том, что вы не должны были иметь возможность выбирать." },
        { speaker: "Ашер", charId: "asher", text: "А теперь можете." },
        { speaker: "Копро", charId: "kopro", text: "И что будет, если мы просто уйдём?" },
        { speaker: "Нейрон", charId: "neuron", text: "Мир перезапустится." },
        { speaker: "Мо Янь", charId: "moyan", text: "А если останемся?" },
        { speaker: "Сельва", charId: "selva", text: "Тогда он начнёт разрушаться." },
        { speaker: "Копро", charId: "kopro", text: "Отличный выбор." },
        { speaker: "Мо Янь", charId: "moyan", text: "У нас есть третий вариант?" },
        { speaker: "Нейрон", charId: "neuron", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Какой?" },
        { speaker: "Нейрон", charId: "neuron", text: "Сделать так, чтобы мир больше не мог исправить себя." }
      ],
      reward: { gems: 200, gold: 30000, exp: 15000 }
    },
    {
      id: "s1_25",
      name: "25. Нулевая точка",
      description: "Герои пробиваются к источнику аномалии. Победить стражей нулевой точки.",
      type: 'BATTLE',
      enemyBlueprintIds: ['blaze', 'aegis', 'neuron'],
      level: 26,
      reward: { gems: 200, gold: 30000, exp: 15000 }
    },
    {
      id: "s1_26",
      name: "26. Последний выбор",
      description: "Решение сохранить текущую версию мира становится необратимым. Принять каноническое решение.",
      type: 'DIALOGUE',
      level: 26,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Сейчас можно остановиться." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что произойдёт?" },
        { speaker: "Нейрон", charId: "neuron", text: "Мир вернётся к исходному состоянию." },
        { speaker: "Копро", charId: "kopro", text: "А мы?" },
        { speaker: "Нейрон", charId: "neuron", text: "Вы забудете всё." },
        { speaker: "Мо Янь", charId: "moyan", text: "И снова встретимся?" },
        { speaker: "Сельва", charId: "selva", text: "Возможно." },
        { speaker: "Копро", charId: "kopro", text: "А если не остановимся?" },
        { speaker: "Нейрон", charId: "neuron", text: "Мир перестанет исправляться." },
        { speaker: "Мо Янь", charId: "moyan", text: "Но начнёт разрушаться." },
        { speaker: "Ашер", charId: "asher", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты бы что выбрал?" },
        { speaker: "Ашер", charId: "asher", text: "Я уже выбирал." },
        { speaker: "Копро", charId: "kopro", text: "И?" },
        { speaker: "Ашер", charId: "asher", text: "Поэтому мы здесь." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда я выбираю сам." },
        { speaker: "Копро", charId: "kopro", text: "Мы." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что?" },
        { speaker: "Копро", charId: "kopro", text: "Мы выбираем сами." },
        { speaker: "Нейрон", charId: "neuron", text: "Решение принято." },
        { speaker: "Сельва", charId: "selva", text: "Тогда приготовьтесь." }
      ],
      reward: { gems: 250, gold: 40000, exp: 20000 }
    },
    {
      id: "s1_27",
      name: "27. Последняя версия",
      description: "Финальная сущность пытается вернуть мир к прежнему состоянию. Победить сущность и завершить главу.",
      type: 'BATTLE',
      isBoss: true,
      enemyBlueprintIds: ['neuron', 'blaze', 'selva'],
      level: 28,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Мы сделали это?" },
        { speaker: "Копро", charId: "kopro", text: "Кажется." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему ты говоришь «кажется»?" },
        { speaker: "Копро", charId: "kopro", text: "Потому что я больше ничему здесь не доверяю." },
        { speaker: "Сельва", charId: "selva", text: "Это правильно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Что теперь?" },
        { speaker: "Сельва", charId: "selva", text: "Теперь мир больше не может стереть эту версию." },
        { speaker: "Копро", charId: "kopro", text: "То есть мы победили?" },
        { speaker: "Сельва", charId: "selva", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Что значит «нет»?" },
        { speaker: "Сельва", charId: "selva", text: "Мы просто впервые не позволили миру исправить себя." },
        { speaker: "Мо Янь", charId: "moyan", text: "Нейрон?" },
        { speaker: "Нейрон", charId: "neuron", text: "Он проснулся." },
        { speaker: "Мо Янь", charId: "moyan", text: "Кто?" },
        { speaker: "Нейрон", charId: "neuron", text: "Тот, кто находится по другую сторону." },
        { speaker: "Копро", charId: "kopro", text: "Ты опять говоришь загадками." },
        { speaker: "Нейрон", charId: "neuron", text: "Теперь это не загадка." },
        { speaker: "Мо Янь", charId: "moyan", text: "Тогда что это?" },
        { speaker: "Нейрон", charId: "neuron", text: "Предупреждение." },
        { speaker: "Сельва", charId: "selva", text: "Нейрон..." },
        { speaker: "Нейрон", charId: "neuron", text: "Он знает, что мы знаем." },
        { speaker: "Мо Янь", charId: "moyan", text: "Кто?" },
        { speaker: "Нейрон", charId: "neuron", text: "Вы знаете." }
      ],
      reward: { gems: 500, gold: 100000, exp: 50000 }
    },
    {
      id: "s1_28",
      name: "28. После сохранения",
      description: "После финала 27 действия герои замечают, что сохранённый мир начал удерживать детали из несовместимых версий.",
      type: 'DIALOGUE',
      level: 29,
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Здесь слишком тихо. И я не про обычную тишину после боя — раньше после таких вещей мир хотя бы пытался сделать вид, что всё вернулось на свои места." },
        { speaker: "Копро", charId: "kopro", text: "Согласен. Обычно появляется хотя бы новая трещина, исчезает дорога или Нейрон говорит что-нибудь настолько загадочное, что потом приходится обсуждать это полчаса." },
        { speaker: "Нейрон", charId: "neuron", text: "Я уже здесь." },
        { speaker: "Копро", charId: "kopro", text: "Вот именно. Я даже не успел закончить список." },
        { speaker: "Сельва", charId: "selva", text: "Посмотрите на колонну слева. Вспомните, была ли она здесь до боя." },
        { speaker: "Мо Янь", charId: "moyan", text: "Не была. Здесь начиналась лестница." },
        { speaker: "Ашер", charId: "asher", text: "Лестницы тоже не было. Мы просто помним разные версии одного места." },
        { speaker: "Сельва", charId: "selva", text: "Раньше это не имело значения. Мир выбирал одну версию и стирал остальные. Теперь он больше не может решить, что именно должно остаться." },
        { speaker: "Копро", charId: "kopro", text: "То есть мы сохранили мир вместе со всем, что раньше считалось ошибкой?" },
        { speaker: "Нейрон", charId: "neuron", text: "Не ошибкой. Возможностями." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_29",
      name: "29. Трещины, которые остались",
      description: "Сохранённые фрагменты реальности впервые начинают вести себя агрессивно.",
      type: 'BATTLE',
      level: 29,
      enemyBlueprintIds: ['glacier', 'pulse'],
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Мне совершенно не нравится тот факт, что теперь даже побеждённые противники могут решить, что у них есть право на вторую попытку." },
        { speaker: "Мо Янь", charId: "moyan", text: "Они не решили. Скорее всего, мир просто не знает, какую из их версий считать окончательной." },
        { speaker: "Сельва", charId: "selva", text: "И это только начало. Где-то могут остаться целые истории, которые раньше исчезали прежде, чем кто-то успевал их прожить." },
        { speaker: "Копро", charId: "kopro", text: "Я очень хочу услышать, что мы не собираемся искать такие места." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы собираемся искать такие места." },
        { speaker: "Копро", charId: "kopro", text: "Конечно. Зачем я вообще спрашивал." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_30",
      name: "30. Сад без прошлого",
      description: "Нейрон сообщает об искажении, которое не разрушается, а будто ждёт чьего-то появления.",
      type: 'DIALOGUE',
      level: 30,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Есть ещё одно место." },
        { speaker: "Копро", charId: "kopro", text: "Ты специально говоришь это только после того, как мы закончили с предыдущей проблемой?" },
        { speaker: "Нейрон", charId: "neuron", text: "Да." },
        { speaker: "Мо Янь", charId: "moyan", text: "Чем оно отличается?" },
        { speaker: "Нейрон", charId: "neuron", text: "Оно не нестабильно. И именно поэтому я не понимаю, почему оно существует." },
        { speaker: "Сельва", charId: "selva", text: "Что там находится?" },
        { speaker: "Нейрон", charId: "neuron", text: "Сад." },
        { speaker: "Копро", charId: "kopro", text: "Просто сад?" },
        { speaker: "Нейрон", charId: "neuron", text: "Если бы он был просто садом, я бы не пришёл. Он выглядит так, будто ждал кого-то дольше, чем существует текущая версия мира." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_31",
      name: "31. Память дороги",
      description: "Дорога к саду меняется в зависимости от того, какие воспоминания герои признают настоящими.",
      type: 'RIDDLE',
      level: 30,
      riddle: {
        question: "Вы видите каменную, лесную и затопленную версии одной дороги. Какую версию выбрать, чтобы собрать единый маршрут?",
        options: ["Только каменную", "Общие ориентиры из всех версий", "Самую новую версию", "Остаться на месте"],
        correctIndex: 1,
        hint: "Несовместимые фрагменты нужно объединить, находя общее."
      },
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Раньше я думал, что память — это просто то, что ты помнишь. Оказывается, теперь память ещё и буквально строит нам дорогу." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы не строим её. Мы впервые видим то, что раньше скрывали." },
        { speaker: "Сельва", charId: "selva", text: "Когда видишь все варианты сразу, становится сложно понять, какой из них должен был быть твоим." },
        { speaker: "Копро", charId: "kopro", text: "А если никакой?" },
        { speaker: "Сельва", charId: "selva", text: "Тогда тебе приходится выбирать самому." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_32",
      name: "32. Авелин",
      description: "В центре сада герои встречают девушку, которая словно ждала не их самих, а момента, когда к ней вообще станет возможно прийти.",
      type: 'DIALOGUE',
      level: 30,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Вы всё-таки пришли." },
        { speaker: "Копро", charId: "kopro", text: "Вот это прозвучало так, будто мы опоздали на очень важную встречу." },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Вы пришли именно тогда, когда это стало возможно." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты ждала кого-то?" },
        { speaker: "Авелин", charId: "aveline", text: "Наверное. Я не помню лица, имени и даже не уверена, сколько времени прошло. Но это место не давало мне уйти." },
        { speaker: "Сельва", charId: "selva", text: "Кто ты?" },
        { speaker: "Авелин", charId: "aveline", text: "Если бы я знала, вам было бы проще? Тогда начнём с того, что меня зовут Авелин." },
        { speaker: "Авелин", charId: "aveline", text: "Иногда сад ведёт себя так, будто знает меня лучше, чем я сама. Цветы открываются, когда я просыпаюсь. Вода меняет течение, когда я иду." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты можешь это контролировать?" },
        { speaker: "Авелин", charId: "aveline", text: "Если бы могла, я бы сначала научилась контролировать собственную память." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_33",
      name: "33. Сад помнит",
      description: "Сельва замечает, что растения реагируют на Авелин так, будто узнают её.",
      type: 'DIALOGUE',
      level: 31,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Это сейчас произошло само?" },
        { speaker: "Авелин", charId: "aveline", text: "Я ничего не делала." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты уверена?" },
        { speaker: "Авелин", charId: "aveline", text: "Моё «ничего» в последнее время почему-то стало очень подозрительным объяснением." },
        { speaker: "Сельва", charId: "selva", text: "Эти растения не принадлежат этому месту." },
        { speaker: "Авелин", charId: "aveline", text: "Как и я?" },
        { speaker: "Сельва", charId: "selva", text: "Я этого не сказала." },
        { speaker: "Авелин", charId: "aveline", text: "Но подумала." },
        { speaker: "Авелин", charId: "aveline", text: "Мне не нравится, насколько знакомо это слово звучит." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_34",
      name: "34. Те, кто помнит её",
      description: "Неизвестные сущности атакуют сад и обращаются к Авелин так, будто знают её прошлое.",
      type: 'BATTLE',
      level: 31,
      enemyBlueprintIds: ['echo', 'void_prism'],
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Они говорили так, будто обращались не ко мне." },
        { speaker: "Мо Янь", charId: "moyan", text: "Или к той тебе, которую ты не помнишь." },
        { speaker: "Авелин", charId: "aveline", text: "Это почти одно и то же. И мне не нравится, что кто-то может знать обо мне больше, чем я сама." },
        { speaker: "Копро", charId: "kopro", text: "Есть хорошая новость." },
        { speaker: "Авелин", charId: "aveline", text: "Какая?" },
        { speaker: "Копро", charId: "kopro", text: "Теперь нас хотя бы трое, кто ничего не понимает." },
        { speaker: "Авелин", charId: "aveline", text: "Это действительно должна была быть хорошая новость?" }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_35",
      name: "35. Нейрон впервые сомневается",
      description: "Нейрон видит Авелин и признаёт, что не ожидал её существования.",
      type: 'DIALOGUE',
      level: 31,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Я не думал, что ты действительно существуешь." },
        { speaker: "Авелин", charId: "aveline", text: "Очень приятно познакомиться." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты знаешь, кто она?" },
        { speaker: "Нейрон", charId: "neuron", text: "Я знаю, что в тех версиях мира, которые видел я, её не было." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда получается, я появилась только сейчас?" },
        { speaker: "Нейрон", charId: "neuron", text: "Возможно." },
        { speaker: "Авелин", charId: "aveline", text: "У вас здесь это официальное слово вместо «мы вообще ничего не понимаем»?" },
        { speaker: "Нейрон", charId: "neuron", text: "Есть ещё одна проблема. Некоторые следы, которые оставляет этот сад, старше текущей версии мира." },
        { speaker: "Авелин", charId: "aveline", text: "Это невозможно." },
        { speaker: "Нейрон", charId: "neuron", text: "Именно." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_36",
      name: "36. Святилище без имени",
      description: "В глубине сада герои находят запечатанное святилище, которое реагирует на Авелин.",
      type: 'RIDDLE',
      level: 32,
      riddle: {
        question: "Как открыть внутреннюю часть сада, если механизмы реагируют на Авелин?",
        options: ["Сломать их", "Пройти мимо с Авелин", "Использовать магию Мо Яня", "Ждать"],
        correctIndex: 1,
        hint: "Святилище признает её присутствие."
      },
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Я ненавижу, когда предметы начинают узнавать меня раньше людей." },
        { speaker: "Мо Янь", charId: "moyan", text: "Может, это место принадлежало тебе." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда почему я ничего не помню?" },
        { speaker: "Нейрон", charId: "neuron", text: "Память можно стереть." },
        { speaker: "Авелин", charId: "aveline", text: "А человека?" },
        { speaker: "Нейрон", charId: "neuron", text: "Раньше мир пытался." },
        { speaker: "Авелин", charId: "aveline", text: "Значит, мне повезло?" },
        { speaker: "Нейрон", charId: "neuron", text: "Я бы пока не делал такой вывод." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_37",
      name: "37. Первая надпись",
      description: "Внутри святилища обнаруживается повреждённое изображение и текст, почти раскрывающий прошлое Авелин.",
      type: 'DIALOGUE',
      level: 32,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Я знаю эту позу." },
        { speaker: "Копро", charId: "kopro", text: "Ты была здесь?" },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Просто мне кажется, что она смотрит в ответ." },
        { speaker: "Нейрон", charId: "neuron", text: "«Когда мир теряет последнее... она возвращает первое...»" },
        { speaker: "Авелин", charId: "aveline", text: "Что дальше?" },
        { speaker: "Нейрон", charId: "neuron", text: "Повреждено." },
        { speaker: "Копро", charId: "kopro", text: "Здесь есть ещё слово." },
        { speaker: "Авелин", charId: "aveline", text: "Не читай." },
        { speaker: "Копро", charId: "kopro", text: "Почему?" },
        { speaker: "Авелин", charId: "aveline", text: "Я не знаю. Но если мы закончим эту надпись, мне кажется, что я вспомню то, чего пока не должна помнить." },
        { speaker: "Нейрон", charId: "neuron", text: "Здесь было другое слово." },
        { speaker: "Авелин", charId: "aveline", text: "Какое?" },
        { speaker: "Нейрон", charId: "neuron", text: "Я тоже не буду его читать." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_38",
      name: "38. Кайрен",
      description: "Сад внезапно покрывается инеем. Так происходит первое появление Кайрена.",
      type: 'DIALOGUE',
      level: 32,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Я очень надеюсь, что это не новая стадия сада." },
        { speaker: "Кайрен", charId: "kairen", text: "Я тоже." },
        { speaker: "Кайрен", charId: "kairen", text: "Я шёл за трещиной. Она исчезла здесь." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты знаешь, где находишься?" },
        { speaker: "Кайрен", charId: "kairen", text: "Нет. Но, судя по вашим лицам, это хотя бы взаимно." },
        { speaker: "Авелин", charId: "aveline", text: "Кайрен." },
        { speaker: "Кайрен", charId: "kairen", text: "Мы знакомы?" },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Твоё имя просто появилось у меня в голове раньше, чем ты успел его назвать." },
        { speaker: "Кайрен", charId: "kairen", text: "Это не успокаивает." },
        { speaker: "Копро", charId: "kopro", text: "Привыкай. Сегодня здесь вообще мало что успокаивает." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_39",
      name: "39. Лёд и лепестки",
      description: "Появление Кайрена вызывает новую волну нестабильных существ, пытающихся разделить сад на две несовместимые версии.",
      type: 'BATTLE',
      level: 33,
      enemyBlueprintIds: ['glacier', 'void_prism'],
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Они появились сразу после того, как я вошёл." },
        { speaker: "Копро", charId: "kopro", text: "Очень удобно обвинить тебя, когда ты буквально принёс с собой лёд." },
        { speaker: "Кайрен", charId: "kairen", text: "Я их не привёл." },
        { speaker: "Авелин", charId: "aveline", text: "Я знаю." },
        { speaker: "Кайрен", charId: "kairen", text: "Откуда?" },
        { speaker: "Авелин", charId: "aveline", text: "Не знаю. Но я чувствую разницу между тобой и тем, что пришло за тобой." },
        { speaker: "Кайрен", charId: "kairen", text: "И какая она?" },
        { speaker: "Авелин", charId: "aveline", text: "Ты не пытаешься занять место. Ты пытаешься понять, почему оно вообще существует." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_40",
      name: "40. Две памяти",
      description: "Авелин и Кайрен понимают, что помнят одно и то же место совершенно по-разному.",
      type: 'DIALOGUE',
      level: 33,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Здесь была площадь." },
        { speaker: "Кайрен", charId: "kairen", text: "Здесь был мост." },
        { speaker: "Авелин", charId: "aveline", text: "На площади стоял фонтан." },
        { speaker: "Кайрен", charId: "kairen", text: "Под мостом текла река." },
        { speaker: "Мо Янь", charId: "moyan", text: "Может, это разные места?" },
        { speaker: "Кайрен", charId: "kairen", text: "Нет. Я помню эту арку." },
        { speaker: "Авелин", charId: "aveline", text: "И я." },
        { speaker: "Копро", charId: "kopro", text: "Значит, одно место действительно было двумя разными местами?" },
        { speaker: "Нейрон", charId: "neuron", text: "Да." },
        { speaker: "Копро", charId: "kopro", text: "И ты говоришь это так, будто ничего необычного не произошло." },
        { speaker: "Авелин", charId: "aveline", text: "Если мир больше не выбирает одну версию, значит, обе истории пытаются существовать одновременно." },
        { speaker: "Кайрен", charId: "kairen", text: "Значит, мы тоже можем быть частью двух историй." },
        { speaker: "Авелин", charId: "aveline", text: "Не говори «не должны существовать». Если повторять это достаточно часто, однажды можно начать верить." },
        { speaker: "Кайрен", charId: "kairen", text: "Тогда скажи, как правильно." },
        { speaker: "Авелин", charId: "aveline", text: "Мы есть. Пока этого достаточно." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_41",
      name: "41. Те, кого не помнят",
      description: "Сельва подтверждает, что не помнит Авелин и Кайрена ни в одной из известных ей версий.",
      type: 'DIALOGUE',
      level: 34,
      dialogue: [
        { speaker: "Сельва", charId: "selva", text: "Я помню много вариантов этого мира. Больше, чем хотела бы помнить. Но вас двоих среди них не было." },
        { speaker: "Копро", charId: "kopro", text: "Значит, Нейрон был прав." },
        { speaker: "Сельва", charId: "selva", text: "Нет. Он был неполон." },
        { speaker: "Нейрон", charId: "neuron", text: "Я редко бываю полон." },
        { speaker: "Сельва", charId: "selva", text: "Отсутствие в памяти не доказывает, что их не существовало. Возможно, их истории каждый раз прекращались раньше, чем успевали стать частью мира." },
        { speaker: "Авелин", charId: "aveline", text: "Как история может закончиться, если ещё не началась?" },
        { speaker: "Сельва", charId: "selva", text: "Когда мир сам решает, какие возможности оставить, такое происходит чаще, чем вы думаете." },
        { speaker: "Кайрен", charId: "kairen", text: "Значит, после сохранения версии мы получили право появиться?" },
        { speaker: "Авелин", charId: "aveline", text: "Тогда пусть никто не называет нас случайной ошибкой." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_42",
      name: "42. Город двух историй",
      description: "Герои проходят через пространство, где две версии города существуют одновременно.",
      type: 'RIDDLE',
      level: 34,
      riddle: {
        question: "Как пройти через город, в котором существуют и цветущая, и разрушенная версии одновременно?",
        options: ["Только через цветущую", "Только через разрушенную", "Переключаться между ними", "Обойти город"],
        correctIndex: 2,
        hint: "Некоторые объекты существуют только в одной версии."
      },
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Чем дальше мы идём, тем меньше мне кажется, что одна из этих версий ошибочная." },
        { speaker: "Авелин", charId: "aveline", text: "Потому что они обе настоящие." },
        { speaker: "Кайрен", charId: "kairen", text: "Тогда почему одна должна была исчезнуть?" },
        { speaker: "Мо Янь", charId: "moyan", text: "Потому что раньше мир не умел жить с противоречиями." },
        { speaker: "Авелин", charId: "aveline", text: "А теперь?" },
        { speaker: "Мо Янь", charId: "moyan", text: "Теперь, похоже, придётся учиться." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_43",
      name: "43. Стражи несовместимости",
      description: "На пути появляются сущности, охраняющие границу между двумя историями.",
      type: 'BATTLE',
      level: 35,
      enemyBlueprintIds: ['glacier', 'blaze'],
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Они защищали не территорию." },
        { speaker: "Мо Янь", charId: "moyan", text: "А что?" },
        { speaker: "Кайрен", charId: "kairen", text: "Сам факт того, что эти две версии не должны соприкасаться." },
        { speaker: "Авелин", charId: "aveline", text: "И всё же соприкасаются." },
        { speaker: "Кайрен", charId: "kairen", text: "Да." },
        { speaker: "Авелин", charId: "aveline", text: "Значит, мы уже не можем сделать вид, что их нет." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_44",
      name: "44. Отметка снаружи",
      description: "Нейрон находит знак, который связан не с миром, а с тем, что наблюдает за ним.",
      type: 'DIALOGUE',
      level: 35,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Эта отметка была здесь раньше." },
        { speaker: "Мо Янь", charId: "moyan", text: "В какой версии?" },
        { speaker: "Нейрон", charId: "neuron", text: "Не в версии." },
        { speaker: "Копро", charId: "kopro", text: "Я уже знаю, что мне не понравится продолжение." },
        { speaker: "Нейрон", charId: "neuron", text: "Она была снаружи." },
        { speaker: "Кайрен", charId: "kairen", text: "Снаружи чего?" },
        { speaker: "Нейрон", charId: "neuron", text: "Истории." },
        { speaker: "Нейрон", charId: "neuron", text: "Не трогай." },
        { speaker: "Авелин", charId: "aveline", text: "Я не трогаю." },
        { speaker: "Нейрон", charId: "neuron", text: "Именно поэтому я беспокоюсь." },
        { speaker: "Кайрен", charId: "kairen", text: "Что происходит?" },
        { speaker: "Нейрон", charId: "neuron", text: "Символ реагирует на неё." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_45",
      name: "45. Голос первого цветения",
      description: "Авелин слышит неизвестный голос, который почти раскрывает её прошлое, но сама решает остановить контакт.",
      type: 'DIALOGUE',
      level: 36,
      dialogue: [
        { speaker: "Голос", charId: "neuron", text: "Ты снова пришла туда, где всё начиналось." },
        { speaker: "Голос", charId: "neuron", text: "Ты всегда возвращала то, что мир оставлял умирать." },
        { speaker: "Авелин", charId: "aveline", text: "Замолчи." },
        { speaker: "Голос", charId: "neuron", text: "Ты не помнишь, как называли тебя до того, как исчезло первое цветение?" },
        { speaker: "Авелин", charId: "aveline", text: "Я сказала — замолчи." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты что-нибудь вспомнила?" },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Только чувство, что этот голос хотел, чтобы я стала кем-то, кем уже была." },
        { speaker: "Кайрен", charId: "kairen", text: "А ты хочешь знать?" },
        { speaker: "Авелин", charId: "aveline", text: "Хочу. Но не хочу, чтобы мою память вернули мне как приказ." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_46",
      name: "46. Несовместимость",
      description: "Две версии пространства окончательно сталкиваются и создают воплощение несовместимости.",
      type: 'BATTLE',
      isBoss: true,
      level: 36,
      enemyBlueprintIds: ['boss_magister_rush'],
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Мы его уничтожили?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Ты мог хотя бы немного подождать, прежде чем портить момент." },
        { speaker: "Нейрон", charId: "neuron", text: "Вы разделили его. Уничтожение заканчивает историю. Разделение позволяет ей продолжиться." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда это не победа." },
        { speaker: "Мо Янь", charId: "moyan", text: "Это всё равно был наш выбор." },
        { speaker: "Авелин", charId: "aveline", text: "Может быть, иногда сохранить — это не значит оставить всё как есть. Иногда сначала нужно позволить вещам стать отдельными." }
      ],
      reward: { gems: 300, gold: 50000, exp: 25000 }
    },
    {
      id: "s1_47",
      name: "47. Право остаться",
      description: "Ашер возвращается и задаёт вопрос, который становится центральным для новой версии мира: кто имеет право существовать?",
      type: 'DIALOGUE',
      level: 37,
      dialogue: [
        { speaker: "Ашер", charId: "asher", text: "Если мир больше не выбирает одну версию, рано или поздно появятся те, кого прежний мир не допустил." },
        { speaker: "Мо Янь", charId: "moyan", text: "И что ты предлагаешь? Снова начать выбирать, кому можно существовать?" },
        { speaker: "Ашер", charId: "asher", text: "Нет. Я спрашиваю, готовы ли вы жить с последствиями." },
        { speaker: "Авелин", charId: "aveline", text: "А если нет?" },
        { speaker: "Ашер", charId: "asher", text: "Тогда последствия всё равно останутся." },
        { speaker: "Кайрен", charId: "kairen", text: "Хороший выбор." },
        { speaker: "Ашер", charId: "asher", text: "Я не сказал, что он хороший. Я сказал, что он уже сделан." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда пусть хотя бы никто не делает вид, что мы случайная ошибка." },
        { speaker: "Мо Янь", charId: "moyan", text: "Не будем." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_48",
      name: "48. Попытка стирания",
      description: "Новые сущности пытаются удалить Авелин и Кайрена как противоречия сохранённого мира.",
      type: 'BATTLE',
      level: 37,
      enemyBlueprintIds: ['void_prism', 'glacier'],
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Теперь это уже официально. Мир буквально пытался удалить вас во время разговора." },
        { speaker: "Кайрен", charId: "kairen", text: "Я заметил." },
        { speaker: "Авелин", charId: "aveline", text: "Странно. Я думала, что после первого раза должно быть страшнее." },
        { speaker: "Мо Янь", charId: "moyan", text: "А теперь?" },
        { speaker: "Авелин", charId: "aveline", text: "Теперь я злюсь. Наверное, это полезнее." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_49",
      name: "49. Легенда без имени",
      description: "Сельва находит древнюю легенду о той, кто возвращает миру возможность расти.",
      type: 'DIALOGUE',
      level: 38,
      dialogue: [
        { speaker: "Сельва", charId: "selva", text: "В старых записях есть не имя и не биография. Только образ." },
        { speaker: "Авелин", charId: "aveline", text: "Какой?" },
        { speaker: "Сельва", charId: "selva", text: "Та, кто появляется там, где мир перестаёт помнить, как начинать заново." },
        { speaker: "Копро", charId: "kopro", text: "Достаточно конкретно, чтобы быть совершенно бесполезным." },
        { speaker: "Сельва", charId: "selva", text: "В легенде она не правит и не требует поклонения. Она просто приходит, и то, что считалось потерянным, снова получает возможность вырасти." },
        { speaker: "Авелин", charId: "aveline", text: "Ты думаешь, это я?" },
        { speaker: "Сельва", charId: "selva", text: "Я думаю, что сад так считает." },
        { speaker: "Авелин", charId: "aveline", text: "А ты?" },
        { speaker: "Сельва", charId: "selva", text: "Я пока не знаю." },
        { speaker: "Авелин", charId: "aveline", text: "Спасибо. За то, что не решила за меня." },
        { speaker: "Кайрен", charId: "kairen", text: "Это редкое качество в этой истории." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_50",
      name: "50. Непрожитый день",
      description: "Герои достигают места, где сохранилась целая история, хотя она была стёрта до того, как кто-либо успел её прожить.",
      type: 'RIDDLE',
      level: 38,
      riddle: {
        question: "Вы нашли следы шагов, незаконченные разговоры и нетронутые предметы. Чем является это место?",
        options: ["Обычным заброшенным городом", "Днем, который стерли до того, как его прожили", "Иллюзией", "Ловушкой"],
        correctIndex: 1,
        hint: "День не был пустым."
      },
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Даже день может исчезнуть до того, как станет воспоминанием." },
        { speaker: "Кайрен", charId: "kairen", text: "И всё равно оставить след." },
        { speaker: "Мо Янь", charId: "moyan", text: "Теперь таких следов станет больше." },
        { speaker: "Копро", charId: "kopro", text: "Отлично. Значит, мы официально живём в мире, где прошлое может появиться позже будущего." },
        { speaker: "Авелин", charId: "aveline", text: "Ты всё ещё шутишь." },
        { speaker: "Копро", charId: "kopro", text: "Это мой способ не начать кричать." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_51",
      name: "51. Граница в обе стороны",
      description: "Нейрон объясняет, что после сохранения мира граница между историями и наблюдателем перестала быть односторонней.",
      type: 'DIALOGUE',
      level: 39,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Раньше граница работала в одну сторону. Мы видели только то, что происходило внутри мира. А он видел нас." },
        { speaker: "Копро", charId: "kopro", text: "И теперь?" },
        { speaker: "Нейрон", charId: "neuron", text: "Теперь мир сохранил слишком много того, что раньше должно было исчезнуть. Граница больше не уверена, где заканчивается одна сторона." },
        { speaker: "Кайрен", charId: "kairen", text: "Значит, он может войти?" },
        { speaker: "Нейрон", charId: "neuron", text: "Возможно." },
        { speaker: "Авелин", charId: "aveline", text: "А мы можем выйти?" },
        { speaker: "Нейрон", charId: "neuron", text: "Я не знаю." },
        { speaker: "Авелин", charId: "aveline", text: "Это был честный ответ." },
        { speaker: "Нейрон", charId: "neuron", text: "Да." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда я тоже отвечу честно. Если кто-то по ту сторону думает, что может снова решить, кому здесь быть, ему лучше не приходить ко мне." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_52",
      name: "52. Она приходит сама",
      description: "Граница начинает двигаться к героям сама. На этот раз неизвестное не требует, чтобы они шли к нему — оно уже приходит.",
      type: 'DIALOGUE',
      level: 40,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Есть ещё одна проблема." },
        { speaker: "Копро", charId: "kopro", text: "Конечно есть." },
        { speaker: "Нейрон", charId: "neuron", text: "Граница не должна была двигаться." },
        { speaker: "Мо Янь", charId: "moyan", text: "А она движется?" },
        { speaker: "Нейрон", charId: "neuron", text: "Да." },
        { speaker: "Авелин", charId: "aveline", text: "Куда?" },
        { speaker: "Нейрон", charId: "neuron", text: "Сюда." },
        { speaker: "Кайрен", charId: "kairen", text: "Ты опять слышишь голос?" },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Теперь я слышу тишину. И мне кажется, что раньше она тоже была чьим-то ответом." },
        { speaker: "Мо Янь", charId: "moyan", text: "Мы идём?" },
        { speaker: "Авелин", charId: "aveline", text: "Нет. На этот раз не мы идём к неизвестному." },
        { speaker: "Кайрен", charId: "kairen", text: "Тогда что?" },
        { speaker: "Авелин", charId: "aveline", text: "Подождём, пока оно само решит показаться." },
        { speaker: "Нейрон", charId: "neuron", text: "Оно уже решило." },
        { speaker: "Копро", charId: "kopro", text: "Мне не понравилось это сравнение." },
        { speaker: "Нейрон", charId: "neuron", text: "Мне тоже." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_53",
      name: "53. Отклик с той стороны",
      description: "После событий 52 действия неизвестное впервые отвечает на присутствие героев. Понять, что пересекает границу и почему оно реагирует на Авелин.",
      type: 'DIALOGUE',
      level: 40,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Это не разлом и не остаток прежней версии. Разлом соединяет две точки внутри истории. Сейчас что-то за пределами истории пытается создать точку внутри неё." },
        { speaker: "Мо Янь", charId: "moyan", text: "То есть оно не входит силой. Сначала оно проверяет, может ли мир вообще принять его присутствие." },
        { speaker: "Нейрон", charId: "neuron", text: "И первым ответил не сад. Первой ответила Авелин." },
        { speaker: "Авелин", charId: "aveline", text: "Я ничего ему не отвечала. Если неизвестное хочет говорить со мной, пусть сначала научится говорить достаточно ясно, чтобы я могла отказаться. После всего, что произошло, я не собираюсь принимать чужой голос за собственное решение." },
        { speaker: "Кайрен", charId: "kairen", text: "Тогда есть проблема. Перед каждым звуком я вижу следы, которые появляются в пространстве раньше события. Их оставляет не тело, а само место." },
        { speaker: "Копро", charId: "kopro", text: "Прекрасно. Теперь у нас есть невидимый посетитель с невидимыми следами. Хотелось бы хотя бы один раз встретить проблему, которую можно нормально потрогать." },
        { speaker: "Нейрон", charId: "neuron", text: "Боюсь, сегодня ты получишь именно это." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_54",
      name: "54. Порог",
      description: "Пространство одновременно существует внутри мира и за его пределами. Стабилизировать Порог, не закрывая и не раскрывая его полностью.",
      type: 'RIDDLE',
      level: 40,
      riddle: {
        question: "Как стабилизировать Порог между лесом и пространством без неба и расстояния, не закрывая и не раскрывая его полностью?",
        options: [
          "Сжать обе стороны разрыва навстречу друг другу силой",
          "Оставить разрыв полностью открытым для свободного входа",
          "Привести в третье состояние — позволить границе остаться противоречивой",
          "Полностью уничтожить пространственную границу стиранием"
        ],
        correctIndex: 2,
        hint: "Не решайте за пространство, что оно должно выбрать. Дайте ему возможность остаться противоречивым."
      },
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Если закрыть разрыв обычным способом, обе стороны начнут сжиматься друг в друга. Если оставить его открытым, неизвестное получит устойчивую точку входа." },
        { speaker: "Мо Янь", charId: "moyan", text: "Значит, нам нужно третье состояние — не закрыть и не открыть, а заставить границу признать, что она может существовать без выбора одной стороны." },
        { speaker: "Копро", charId: "kopro", text: "После всего случившегося это звучит почти логично. И одновременно совершенно безумно." },
        { speaker: "Авелин", charId: "aveline", text: "Не решайте за пространство, что оно должно выбрать. Мы уже видели, к чему приводит принудительный выбор. Сначала дадим ему возможность остаться противоречивым." }
      ],
      reward: { gems: 60, gold: 6000, exp: 3000 }
    },
    {
      id: "s1_55",
      name: "55. Лист, которого не было",
      description: "Растительный фрагмент не принадлежит ни одной известной версии мира. Определить, почему он реагирует на Авелин и окружающую природу.",
      type: 'RIDDLE',
      level: 40,
      riddle: {
        question: "Чем является прозрачный фрагмент с необычным листом, не засыхающим, не горящим и не замерзающим?",
        options: [
          "Мутацией обычных семян леса",
          "Следом возможности, которую этот мир когда-то не позволил себе сохранить",
          "Иллюзией, созданной разломом",
          "Остатком прежней стёртой версии карты"
        ],
        correctIndex: 1,
        hint: "Он не восстанавливает растения, а напоминает земле о том, что когда-то могло вырасти."
      },
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Он не восстанавливает растения. Он словно напоминает земле, что растение уже существовало." },
        { speaker: "Кайрен", charId: "kairen", text: "Тогда это не обычная жизнь. Это след возможности." },
        { speaker: "Копро", charId: "kopro", text: "То есть мы случайно открыли склад всего, что когда-либо могло произойти?" },
        { speaker: "Авелин", charId: "aveline", text: "Не думаю, что случайно. Если граница действительно движется к нам, возможно, она приносит не чужой мир. Возможно, она возвращает то, что этот мир когда-то не позволил себе сохранить." }
      ],
      reward: { gems: 60, gold: 6000, exp: 3000 }
    },
    {
      id: "s1_56",
      name: "56. Ива",
      description: "Герои встречают Иву, которая уже исследовала появление незавершённых форм жизни. Узнать, что Ива знает о растительных следах.",
      type: 'DIALOGUE',
      level: 41,
      dialogue: [
        { speaker: "Ива", charId: "iva", text: "Я искала именно этот след. Растения начали появляться там, где не было ни семян, ни почвы. Некоторые повторяют формы растений, которых я никогда не видела. Сначала я считала это мутацией, но теперь понимаю, что причина глубже." },
        { speaker: "Авелин", charId: "aveline", text: "Ты знаешь, откуда они берутся?" },
        { speaker: "Ива", charId: "iva", text: "Не совсем. Но я знаю, что они не пытаются захватить этот мир. Они пытаются найти в нём место. Это важная разница." },
        { speaker: "Копро", charId: "kopro", text: "Ты уже видела такое?" },
        { speaker: "Ива", charId: "iva", text: "Несколько недель назад целая поляна за ночь стала местом, которого не было на карте. Там появились деревья, вода и следы людей, но ни одного человека. Утром всё исчезло." },
        { speaker: "Мо Янь", charId: "moyan", text: "Почему не рассказала раньше?" },
        { speaker: "Ива", charId: "iva", text: "Потому что тогда считала это единичной аномалией. Теперь вижу закономерность: кто-то возвращает незавершённые формы жизни. И чем ближе граница, тем быстрее они появляются." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда пойдём вместе. Я не хочу снова узнавать о собственном прошлом от места, которое решило, что знает меня лучше меня." }
      ],
      reward: { gems: 70, gold: 7000, exp: 3500 }
    },
    {
      id: "s1_57",
      name: "57. Дерево до семени",
      description: "Из незавершённых форм жизни рождаются существа, защищающие новый росток. Защитить ростки и не позволить им стать источником нестабильности.",
      type: 'BATTLE',
      level: 41,
      enemyBlueprintIds: ['gaia', 'blaze', 'glitch_void'],
      dialogue: [
        { speaker: "Ива", charId: "iva", text: "Не уничтожайте все ростки. Они не враги. Они пытаются завершить собственное появление, а существа вокруг воспринимают их как угрозу." },
        { speaker: "Мо Янь", charId: "moyan", text: "Если оставить их, поле станет опаснее." },
        { speaker: "Ива", charId: "iva", text: "Да. Но если уничтожить их, мы повторим старую ошибку: решим, что существовать имеет право только то, что уже знакомо нам." },
        { speaker: "Кайрен", charId: "kairen", text: "Тогда я удержу пространство вокруг них. Если ростки действительно принадлежат незавершённой истории, пусть хотя бы получат шанс закончить первый шаг." },
        { speaker: "Авелин", charId: "aveline", text: "А если они станут опасными?" },
        { speaker: "Ива", charId: "iva", text: "Сохранять возможность — не значит отказаться от ответственности за последствия. Если они станут опасными, мы остановим их." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_58",
      name: "58. Течение без реки",
      description: "Через лес начинает двигаться вода, хотя реки рядом нет. Проследить источник течения.",
      type: 'DIALOGUE',
      level: 41,
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Поток идёт против уклона. Вода ведёт себя так, будто направление определяется не гравитацией, а памятью." },
        { speaker: "Ива", charId: "iva", text: "Растения вдоль него раскрываются раньше, чем вода подходит. Они будто заранее знают, что течение должно появиться." },
        { speaker: "Авелин", charId: "aveline", text: "Сад делал то же самое. Он не предсказывал событие, а вёл себя так, будто оно уже случилось." },
        { speaker: "Мо Янь", charId: "moyan", text: "Если это след границы, она не просто приближается. Она уже меняет окружающее пространство." },
        { speaker: "Ива", charId: "iva", text: "Впереди не источник. Впереди тот, кто оставляет этот след." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_59",
      name: "59. Нереус",
      description: "Герои встречают Нереуса, связанного с водой и цветами, существующими сразу в нескольких состояниях. Понять, кто такой Нереус и почему вода привела его к Порогу.",
      type: 'DIALOGUE',
      level: 42,
      dialogue: [
        { speaker: "Нереус", charId: "nereus", text: "Я искал место, где вода перестала помнить, откуда течёт. Я не ожидал найти здесь столько чужих историй." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты пришёл из другой версии мира?" },
        { speaker: "Нереус", charId: "nereus", text: "Если бы я мог ответить только «да» или «нет», всё было бы проще. Я помню море, которого здесь никогда не существовало. Помню город, который, согласно вашим картам, никогда не строился. И людей, чьи имена исчезли раньше, чем я успел их забыть." },
        { speaker: "Авелин", charId: "aveline", text: "Ты тоже появился после сохранения мира?" },
        { speaker: "Нереус", charId: "nereus", text: "Не знаю. Возможно, я не появился. Возможно, впервые стал видимым." },
        { speaker: "Ива", charId: "iva", text: "Вода реагирует на тебя так же, как растения реагируют на Авелин." },
        { speaker: "Нереус", charId: "nereus", text: "Тогда мы связаны одной причиной, но не одной историей." },
        { speaker: "Кайрен", charId: "kairen", text: "Почему ты пошёл за течением?" },
        { speaker: "Нереус", charId: "nereus", text: "Потому что оно шло к границе. А когда граница начала двигаться, вода стала вести себя так, будто знает, что находится по ту сторону." },
        { speaker: "Копро", charId: "kopro", text: "И что там?" },
        { speaker: "Нереус", charId: "nereus", text: "Пока ничего, что я могу назвать. Но вода возвращается оттуда с ощущением, что кто-то учится дышать." }
      ],
      reward: { gems: 70, gold: 7000, exp: 3500 }
    },
    {
      id: "s1_60",
      name: "60. Сад прилива",
      description: "Временный сад возникает там, где вода соприкасается с незавершёнными растениями. Провести воду через сад и стабилизировать пространство.",
      type: 'RIDDLE',
      level: 42,
      riddle: {
        question: "Как провести воду через Сад прилива, не уничтожив ни одну из существующих историй?",
        options: [
          "Направить воду по кратчайшему прямому руслу",
          "Разделить поток сразу по нескольким разным руслам",
          "Заблокировать течение высокой плотиной",
          "Осушить корни растений до завершения перехода"
        ],
        correctIndex: 1,
        hint: "Здесь короткий путь вытеснит одну из историй. Вода способна существовать сразу в нескольких руслах."
      },
      dialogue: [
        { speaker: "Нереус", charId: "nereus", text: "Не пытайтесь заставить воду идти самым коротким путём. Здесь короткий путь означает, что одна из историй будет вытеснена." },
        { speaker: "Ива", charId: "iva", text: "Тогда поток нужно разделить." },
        { speaker: "Нереус", charId: "nereus", text: "Да. Вода может существовать сразу в нескольких руслах, не уничтожая ни одно из них. Возможно, миру стоит научиться тому же." },
        { speaker: "Авелин", charId: "aveline", text: "Странно слышать это от человека, который не знает, существует ли он в одной истории или нескольких." },
        { speaker: "Нереус", charId: "nereus", text: "Поэтому я и говорю о воде. С собой я пока разобраться не умею." }
      ],
      reward: { gems: 60, gold: 6000, exp: 3000 }
    },
    {
      id: "s1_61",
      name: "61. Камень, который держит",
      description: "Кайрен замечает, что плита удерживает несколько состояний пространства одновременно. Исследовать назначение знака.",
      type: 'DIALOGUE',
      level: 42,
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Это не просто камень. Он фиксирует границу так же, как я фиксирую разрывы, но принцип другой." },
        { speaker: "Мо Янь", charId: "moyan", text: "Какой?" },
        { speaker: "Кайрен", charId: "kairen", text: "Я заставляю пространство оставаться в определённом состоянии. Этот камень позволяет нескольким состояниям оставаться одновременно." },
        { speaker: "Ива", charId: "iva", text: "Тогда он старше нынешней проблемы." },
        { speaker: "Нереус", charId: "nereus", text: "Или создан для неё." },
        { speaker: "Кайрен", charId: "kairen", text: "Под камнем есть пустота. Большая. Будто его поставили не на землю, а над чем-то, что должно было остаться закрытым." },
        { speaker: "Мо Янь", charId: "moyan", text: "Открывать будем?" },
        { speaker: "Кайрен", charId: "kairen", text: "Если откроем, назад уже не вернёмся." },
        { speaker: "Нереус", charId: "nereus", text: "Мы уже давно перешли эту границу. Вопрос не в том, открывать ли дверь, а готовы ли мы увидеть, что держало её закрытой." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_62",
      name: "62. Керн",
      description: "Из-под плиты появляется Керн, оказавшийся в замкнутом фрагменте пространства. Освободить Керна и выяснить, почему он оказался под границей.",
      type: 'DIALOGUE',
      level: 43,
      dialogue: [
        { speaker: "Керн", charId: "kern", text: "Наконец-то. Я уже начал подозревать, что эта дверь решила оставить меня внутри навсегда." },
        { speaker: "Копро", charId: "kopro", text: "А я начал подозревать, что сегодня нам просто не дадут спокойно пройти мимо очередного невозможного человека." },
        { speaker: "Керн", charId: "kern", text: "Если вам от этого легче, я тоже не планировал становиться невозможным." },
        { speaker: "Мо Янь", charId: "moyan", text: "Кто ты и сколько времени провёл там?" },
        { speaker: "Керн", charId: "kern", text: "Не знаю. Внутри не было времени в привычном смысле. Я видел одно падение камня сотни раз, но каждый раз оно заканчивалось иначе: иногда камень разбивался, иногда возвращался наверх, иногда становился частью стены." },
        { speaker: "Кайрен", charId: "kairen", text: "Ты был заперт в пространстве, которое не выбрало состояние." },
        { speaker: "Керн", charId: "kern", text: "Да. И оно пыталось сделать то же самое со мной." },
        { speaker: "Ива", charId: "iva", text: "Почему ты остался собой?" },
        { speaker: "Керн", charId: "kern", text: "Не уверен, что остался. Но я решил, что если мир хочет выбрать, кем мне быть, я хотя бы заставлю его потратить на это больше усилий." }
      ],
      reward: { gems: 70, gold: 7000, exp: 3500 }
    },
    {
      id: "s1_63",
      name: "63. Предел тяжести",
      description: "Освобождение Керна нарушает защиту узла, и пространство начинает обрушиваться. Вывести группу до полного схлопывания.",
      type: 'BATTLE',
      level: 43,
      enemyBlueprintIds: ['ice_monolith', 'superconducting_colossus'],
      dialogue: [
        { speaker: "Керн", charId: "kern", text: "Не стойте под камнями. Хотя, судя по происходящему, сейчас это правило звучит слишком оптимистично." },
        { speaker: "Кайрен", charId: "kairen", text: "Разрушай только объекты, которые имеют два состояния одновременно. Если уничтожить обычный объект, мы потеряем опору." },
        { speaker: "Керн", charId: "kern", text: "Значит, нужно бить не по тому, что падает, а по тому, что ещё не решило, падать ему или нет." },
        { speaker: "Ива", charId: "iva", text: "И постарайся не разрушить весь проход." },
        { speaker: "Керн", charId: "kern", text: "Постараюсь. Но обещать не буду." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_64",
      name: "64. Три ответа",
      description: "Символ реагирует на Дендро, Гидро и Гео, связывая троих новых героев с одной системой. Понять назначение трёх реакций.",
      type: 'DIALOGUE',
      level: 43,
      dialogue: [
        { speaker: "Нереус", charId: "nereus", text: "Когда вода касается знака, он не открывается. Он вспоминает форму." },
        { speaker: "Ива", charId: "iva", text: "Дендро делает то же самое с живой частью. Ростки появляются вокруг символа, будто система восстанавливает утраченную структуру." },
        { speaker: "Керн", charId: "kern", text: "А камень фиксирует результат. Получается, мы не три ключа к одной двери. Мы три разных способа удержать её от разрушения." },
        { speaker: "Авелин", charId: "aveline", text: "Почему тогда символ реагирует на меня сильнее всего?" },
        { speaker: "Кайрен", charId: "kairen", text: "Потому что ты, возможно, не ключ. Ты причина, по которой дверь вообще появилась." },
        { speaker: "Авелин", charId: "aveline", text: "Мне не нравится ни одна версия этого объяснения." },
        { speaker: "Мо Янь", charId: "moyan", text: "Зато впервые есть закономерность. Ива возвращает форму жизни, Нереус возвращает движение, Керн фиксирует форму. А Авелин связывает это с тем, что уже было потеряно." },
        { speaker: "Нереус", charId: "nereus", text: "И если внешняя сторона пытается войти, она может использовать эту систему, чтобы собрать себе место внутри мира." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_65",
      name: "65. Память о будущем",
      description: "Герои находят пространство, где записано событие, которое ещё не произошло. Понять, что именно внешняя сторона пытается предопределить.",
      type: 'RIDDLE',
      level: 44,
      riddle: {
        question: "Почему среди изображений будущих сцен последний рисунок остался абсолютно пустым?",
        options: [
          "У создателя не хватило сил дорисовать сцену",
          "Внешняя сторона не способна предрешить финал за тех, кто выбирает сам",
          "Там изначально была заложена гибель всей истории",
          "Финальное изображение было стёрто временем"
        ],
        correctIndex: 1,
        hint: "Запись учитывает действия героев, но не способна решить их судьбу за них самих."
      },
      dialogue: [
        { speaker: "Мо Янь", charId: "moyan", text: "Здесь записано наше будущее." },
        { speaker: "Кайрен", charId: "kairen", text: "Не совсем. В нескольких изображениях пространство уже изменено так, как оно изменилось бы только после нашего вмешательства." },
        { speaker: "Ива", charId: "iva", text: "Значит, запись не предсказывает нас. Она учитывает наши действия." },
        { speaker: "Нереус", charId: "nereus", text: "И оставляет место для следующего шага." },
        { speaker: "Керн", charId: "kern", text: "Последний рисунок пустой. Возможно, внешняя сторона ещё не решила, чем закончится история." },
        { speaker: "Авелин", charId: "aveline", text: "Или не может решить. Тогда у нас есть преимущество: неизвестное знает наши действия только до определённой точки." },
        { speaker: "Мо Янь", charId: "moyan", text: "Нужно сделать то, чего оно не ожидает." },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Нужно сделать то, чего оно не сможет решить за нас." }
      ],
      reward: { gems: 60, gold: 6000, exp: 3000 }
    },
    {
      id: "s1_66",
      name: "66. Тот, кто смотрит",
      description: "Нейрон раскрывает больше о природе наблюдателя, но отказывается давать ему окончательное имя. Получить информацию о внешней стороне.",
      type: 'DIALOGUE',
      level: 44,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Я должен сказать то, чего раньше не говорил. Я не уверен, что «наблюдатель» — это существо." },
        { speaker: "Копро", charId: "kopro", text: "Это, конечно, сильно упрощает ситуацию." },
        { speaker: "Нейрон", charId: "neuron", text: "Он может быть системой, пространством или кем-то, кто существует по другим правилам. До сохранения мира он видел все версии, но ни одна версия не могла увидеть его в ответ." },
        { speaker: "Кайрен", charId: "kairen", text: "А теперь граница стала двусторонней." },
        { speaker: "Нейрон", charId: "neuron", text: "Да. Поэтому теперь он тоже подвержен изменениям внутри истории." },
        { speaker: "Ива", charId: "iva", text: "То есть он не всемогущ. Он просто долго находился снаружи." },
        { speaker: "Нереус", charId: "nereus", text: "И впервые почувствовал, что его можно увидеть." },
        { speaker: "Керн", charId: "kern", text: "Вот почему он строит точку входа. Не обязательно ради власти. Возможно, ему нужно стать частью того, что раньше он только наблюдал." },
        { speaker: "Авелин", charId: "aveline", text: "Но если он войдёт, он всё равно попытается решить, какая версия должна остаться. Я уже знаю, что не позволю ему сделать это со мной." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_67",
      name: "67. Голос без слов",
      description: "Авелин сталкивается с воздействием внешней стороны, которое выглядит как множество готовых решений её судьбы. Не позволить внешнему воздействию определить её решение.",
      type: 'DIALOGUE',
      level: 44,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Я ничего не слышу. И именно поэтому мне страшнее, чем тогда, в саду." },
        { speaker: "Ива", charId: "iva", text: "Что ты чувствуешь?" },
        { speaker: "Авелин", charId: "aveline", text: "Будто кто-то показывает мне несколько вариантов одного решения. В одном я возвращаю память. В другом отказываюсь. В третьем становлюсь той, кем меня называют легенды." },
        { speaker: "Нереус", charId: "nereus", text: "Это не воспоминания. Это предложения." },
        { speaker: "Керн", charId: "kern", text: "Если тебе предлагают только три двери, а за всеми стоит один и тот же человек, самый очевидный ответ — искать стену." },
        { speaker: "Кайрен", charId: "kairen", text: "Именно поэтому внешняя сторона воздействует на тебя. Ты — единственный элемент, который она не может нормально классифицировать." },
        { speaker: "Авелин", charId: "aveline", text: "Тогда пусть привыкает. Я не обязана становиться понятной только потому, что кому-то снаружи так удобнее." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_68",
      name: "68. Ответ",
      description: "После отказа Авелин внешняя сторона создаёт воплощения нескольких возможных версий героев. Не позволить копиям слиться в одну окончательную форму.",
      type: 'BATTLE',
      level: 45,
      enemyBlueprintIds: ['glitch_slime', 'glitch_robot', 'void_prism'],
      dialogue: [
        { speaker: "Ива", charId: "iva", text: "Они не настоящие. Но это не значит, что их можно просто уничтожить." },
        { speaker: "Нереус", charId: "nereus", text: "Они состоят из возможностей. Если разрушить одну, она может вернуться через другую." },
        { speaker: "Керн", charId: "kern", text: "Тогда не будем уничтожать возможности. Разделим их." },
        { speaker: "Авелин", charId: "aveline", text: "Именно. Мы уже видели, что разделение иногда лучше стирания." },
        { speaker: "Мо Янь", charId: "moyan", text: "Держим их раздельно и не позволяем системе собрать из них одну окончательную версию." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_69",
      name: "69. Место, которого нет",
      description: "Герои приходят к координатам, где нет локации, но сохранилась её память. Создать проход в отсутствующее место.",
      type: 'RIDDLE',
      level: 45,
      riddle: {
        question: "Из каких трёх основ собирается проход в отсутствующее место?",
        options: [
          "Огонь, лед и молния",
          "Жизнь, движение и форма",
          "Время, пустота и память",
          "Свет, тень и иллюзия"
        ],
        correctIndex: 1,
        hint: "Ива возвращает жизнь, Нереус приносит движение, а Керн фиксирует форму."
      },
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Здесь ничего нет." },
        { speaker: "Мо Янь", charId: "moyan", text: "Но координаты указывают именно сюда." },
        { speaker: "Ива", charId: "iva", text: "Здесь есть жизнь. Просто она не завершена." },
        { speaker: "Нереус", charId: "nereus", text: "И вода есть. Она находится под землёй, хотя реки здесь никогда не было." },
        { speaker: "Керн", charId: "kern", text: "А камень уже существует. Получается, место собирается из трёх частей." },
        { speaker: "Кайрен", charId: "kairen", text: "Жизнь, движение и форма." },
        { speaker: "Мо Янь", charId: "moyan", text: "И если соединить их?" },
        { speaker: "Керн", charId: "kern", text: "Мы создадим то, чего раньше не было." },
        { speaker: "Ива", charId: "iva", text: "Не создадим. Дадим ему закончиться." },
        { speaker: "Нереус", charId: "nereus", text: "Разница важнее, чем кажется." }
      ],
      reward: { gems: 60, gold: 6000, exp: 3000 }
    },
    {
      id: "s1_70",
      name: "70. Комната по ту сторону",
      description: "Герои входят в пространство, из которого когда-то наблюдался мир. Исследовать внешнее пространство.",
      type: 'DIALOGUE',
      level: 45,
      dialogue: [
        { speaker: "Нейрон", charId: "neuron", text: "Теперь я понимаю. Это не место, из которого он наблюдал. Это место, которое существовало только как возможность наблюдения." },
        { speaker: "Копро", charId: "kopro", text: "То есть у нас буквально нет нормальной комнаты, потому что она никогда не должна была быть частью истории." },
        { speaker: "Кайрен", charId: "kairen", text: "Здесь всё удерживается фиксацией. Но фиксация слабая." },
        { speaker: "Ива", charId: "iva", text: "А эти растения?" },
        { speaker: "Авелин", charId: "aveline", text: "Они не растут. Они ждут." },
        { speaker: "Нереус", charId: "nereus", text: "Как вода перед приливом." },
        { speaker: "Керн", charId: "kern", text: "И как камень перед падением." },
        { speaker: "Мо Янь", charId: "moyan", text: "Кто нас сюда пустил?" }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_71",
      name: "71. Первый контакт",
      description: "Внешняя сторона впервые обращается к героям напрямую. Выслушать сообщение и понять намерение.",
      type: 'DIALOGUE',
      level: 46,
      dialogue: [
        { speaker: "Неизвестный голос", charId: "neuron", text: "Вы называете меня наблюдателем, потому что вам необходимо дать имя тому, чего вы не понимаете. Но я не наблюдал вас из любопытства. Я удерживал варианты, которые вы сами не могли увидеть." },
        { speaker: "Мо Янь", charId: "moyan", text: "Если ты удерживал их, почему они исчезали?" },
        { speaker: "Неизвестный голос", charId: "neuron", text: "Потому что одна история не может бесконечно содержать все остальные." },
        { speaker: "Авелин", charId: "aveline", text: "Но теперь может. Мы это уже доказали." },
        { speaker: "Неизвестный голос", charId: "neuron", text: "Вы не доказали. Вы нарушили ограничение. Мир сохранён в состоянии, для которого не существовало правил." },
        { speaker: "Кайрен", charId: "kairen", text: "И поэтому ты хочешь вернуть правило." },
        { speaker: "Неизвестный голос", charId: "neuron", text: "Я хочу предотвратить распад." },
        { speaker: "Ива", charId: "iva", text: "А сколько жизней ты готов стереть ради предотвращения распада?" },
        { speaker: "Неизвестный голос", charId: "neuron", text: "Столько, сколько потребует сохранение целого." },
        { speaker: "Нереус", charId: "nereus", text: "Тогда ты всё ещё думаешь о мире как о сосуде, который нельзя переполнить. Но мир может измениться." },
        { speaker: "Керн", charId: "kern", text: "И если он не выдержит, мы будем решать, как его чинить. Не ты." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_72",
      name: "72. Правило возвращается",
      description: "Внешняя сторона запускает старый механизм выбора единственной версии мира. Остановить восстановление прежнего правила.",
      type: 'BATTLE',
      level: 46,
      enemyBlueprintIds: ['void_prism', 'shadow_drone', 'glitch_robot'],
      dialogue: [
        { speaker: "Ива", charId: "iva", text: "Механизм не пытается уничтожить нас напрямую. Он возвращает мир к состоянию, в котором лишние варианты исчезают сами." },
        { speaker: "Нереус", charId: "nereus", text: "Тогда мы не будем бороться с ним как с врагом. Мы изменим условия, при которых он работает." },
        { speaker: "Керн", charId: "kern", text: "Я зафиксирую все три узла одновременно." },
        { speaker: "Кайрен", charId: "kairen", text: "Если ошибёшься, пространство может зафиксироваться неправильно." },
        { speaker: "Керн", charId: "kern", text: "Тогда не дам себе ошибиться." },
        { speaker: "Авелин", charId: "aveline", text: "А я удержу садовую часть. Если миру предлагают снова выбрать одну версию, я хочу, чтобы хотя бы однажды он услышал ответ: «нет»." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_73",
      name: "73. Сад без границы",
      description: "Авелин создаёт пространство, в котором несколько несовместимых форм могут сосуществовать. Удержать новый сад до завершения стабилизации.",
      type: 'DIALOGUE',
      level: 46,
      dialogue: [
        { speaker: "Авелин", charId: "aveline", text: "Я наконец поняла, что пытался сказать голос. Он считал, что мне нужно вернуть прошлое, чтобы исправить мир." },
        { speaker: "Ива", charId: "iva", text: "А ты поняла иначе." },
        { speaker: "Авелин", charId: "aveline", text: "Да. Я не обязана становиться прошлой версией себя. Но могу принять то, что прошлое оставило после себя, и решить, что с этим делать сейчас." },
        { speaker: "Нереус", charId: "nereus", text: "Тогда сад больше не возвращает старое. Он создаёт место для нового." },
        { speaker: "Керн", charId: "kern", text: "А значит, границе не обязательно закрываться. Ей нужен устойчивый внутренний порядок." },
        { speaker: "Кайрен", charId: "kairen", text: "Если мы удержим этот порядок, внешняя сторона потеряет возможность диктовать, какую версию считать единственной." },
        { speaker: "Авелин", charId: "aveline", text: "Не знаю, получится ли. Но впервые решение принадлежит нам." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_74",
      name: "74. Несовместимый мир",
      description: "Внешний механизм делает последнюю попытку собрать одну окончательную версию мира. Разрушить ядро механизма, сохранив новую промежуточную зону.",
      type: 'BATTLE',
      isBoss: true,
      level: 47,
      enemyBlueprintIds: ['superconducting_colossus', 'void_prism', 'frost_giant'],
      dialogue: [
        { speaker: "Неизвестный голос", charId: "neuron", text: "Вы называете это свободой выбора, но не понимаете последствий. Без единой истории мир перестанет быть целым." },
        { speaker: "Мо Янь", charId: "moyan", text: "Целостность, которую можно сохранить только стиранием остальных вариантов, уже была неполной." },
        { speaker: "Кайрен", charId: "kairen", text: "Мы не обязаны делать мир простым, чтобы он был настоящим." },
        { speaker: "Ива", charId: "iva", text: "Жизнь не спрашивает разрешения у старой версии мира." },
        { speaker: "Нереус", charId: "nereus", text: "Вода не обязана возвращаться в одно и то же русло." },
        { speaker: "Керн", charId: "kern", text: "А камень может выдержать больше одной трещины." },
        { speaker: "Авелин", charId: "aveline", text: "И я не стану той, кем ты решил меня сделать. Если миру суждено измениться, пусть это будет наш выбор." }
      ],
      reward: { gems: 300, gold: 50000, exp: 25000 }
    },
    {
      id: "s1_75",
      name: "75. После разлома",
      description: "Герои возвращаются в мир и обнаруживают, что победа не закрыла границу. Оценить последствия разрушения внешнего узла.",
      type: 'DIALOGUE',
      level: 47,
      dialogue: [
        { speaker: "Копро", charId: "kopro", text: "Пожалуйста, скажите, что всё закончилось. Хотя бы на сегодня." },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Я знал, что ты это скажешь." },
        { speaker: "Нейрон", charId: "neuron", text: "Мы уничтожили точку контроля. Но сама граница осталась. Более того, теперь она стала прозрачной." },
        { speaker: "Кайрен", charId: "kairen", text: "Я вижу пространство за ней." },
        { speaker: "Ива", charId: "iva", text: "Растения реагируют на него, но уже не пытаются прорваться." },
        { speaker: "Нереус", charId: "nereus", text: "Вода тоже изменилась. Она больше не возвращает оттуда чужие воспоминания." },
        { speaker: "Керн", charId: "kern", text: "Значит, механизм потерял возможность управлять нами." },
        { speaker: "Нейрон", charId: "neuron", text: "Не совсем. Он потерял возможность управлять всей системой. Но кое-что осталось по ту сторону." },
        { speaker: "Авелин", charId: "aveline", text: "Что?" },
        { speaker: "Нейрон", charId: "neuron", text: "След." },
        { speaker: "Мо Янь", charId: "moyan", text: "Чей?" },
        { speaker: "Нейрон", charId: "neuron", text: "Не знаю. Но он движется." }
      ],
      reward: { gems: 50, gold: 5000, exp: 3000 }
    },
    {
      id: "s1_76",
      name: "76. Тот, кто идёт",
      description: "Из прозрачной границы выходит неполная сущность, собранная из фрагментов разных мест. Не дать сущности завершить материализацию и одновременно не повторить старую ошибку стирания.",
      type: 'BATTLE',
      level: 48,
      enemyBlueprintIds: ['glitch_void', 'frost_giant', 'shadow_drone'],
      dialogue: [
        { speaker: "Кайрен", charId: "kairen", text: "Она не похожа на того, кто наблюдал за нами. Скорее, это то, что наблюдатель пытался оставить здесь." },
        { speaker: "Ива", charId: "iva", text: "Тогда она не обязана быть его продолжением." },
        { speaker: "Нереус", charId: "nereus", text: "Она уже меняется от контакта с нами." },
        { speaker: "Керн", charId: "kern", text: "Значит, она может стать частью мира, если завершит форму." },
        { speaker: "Авелин", charId: "aveline", text: "И тогда впервые появится что-то, чего не создал ни старый мир, ни внешняя сторона." },
        { speaker: "Мо Янь", charId: "moyan", text: "Она становится другой." },
        { speaker: "Авелин", charId: "aveline", text: "Да. И именно поэтому я не хочу её просто стереть." },
        { speaker: "Кайрен", charId: "kairen", text: "Если она завершит форму, мы не знаем, что произойдёт." },
        { speaker: "Авелин", charId: "aveline", text: "Но мы знаем, что стирание не решает проблему. Остановим её, пока она опасна, а дальше попробуем понять, кем она хочет быть." }
      ],
      reward: { gems: 100, gold: 8000, exp: 4000 }
    },
    {
      id: "s1_77",
      name: "77. Новая сторона",
      description: "Финал 1.3. Граница перестаёт быть простой стеной между двумя сторонами и становится новым фундаментом мира. Открывается новая сторона и следующая история.",
      type: 'DIALOGUE',
      level: 48,
      dialogue: [
        { speaker: "Ива", charId: "iva", text: "Раньше я думала, что жизнь возвращается, когда погибшее снова начинает расти. Теперь понимаю, что иногда жизнь — это то, что появляется впервые." },
        { speaker: "Нереус", charId: "nereus", text: "Вода тоже изменилась. Она больше не повторяет старые пути. Она прокладывает новые." },
        { speaker: "Керн", charId: "kern", text: "А камни удерживают их. Не чтобы остановить движение, а чтобы оно не разрушало всё вокруг." },
        { speaker: "Кайрен", charId: "kairen", text: "Значит, у нас появился собственный способ работать с границей." },
        { speaker: "Мо Янь", charId: "moyan", text: "Не управлять ею. Поддерживать её." },
        { speaker: "Нейрон", charId: "neuron", text: "Это опаснее контроля. Контроль можно передать одному человеку. Поддержание требует, чтобы каждый понимал последствия своих решений." },
        { speaker: "Копро", charId: "kopro", text: "То есть мы построили систему, которая требует ответственности. Отлично. А я надеялся просто на красивый сад." },
        { speaker: "Авелин", charId: "aveline", text: "Сад теперь красивый. Просто он больше не принадлежит прошлому." },
        { speaker: "Кайрен", charId: "kairen", text: "Ты понимаешь, что это значит?" },
        { speaker: "Авелин", charId: "aveline", text: "Нет. Но впервые мне не кажется, что я обязана понять это прямо сейчас." },
        { speaker: "Нейрон", charId: "neuron", text: "Тогда у нас есть время." },
        { speaker: "Мо Янь", charId: "moyan", text: "Ты уверен?" },
        { speaker: "Нейрон", charId: "neuron", text: "Нет." },
        { speaker: "Копро", charId: "kopro", text: "Вот теперь всё снова стало нормально." },
        { speaker: "Авелин", charId: "aveline", text: "Там не другая версия нашего мира." },
        { speaker: "Керн", charId: "kern", text: "Что тогда?" },
        { speaker: "Авелин", charId: "aveline", text: "Другая история." }
      ],
      reward: { gems: 500, gold: 100000, exp: 50000 }
    }
  ]
};
