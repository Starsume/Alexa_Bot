const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const autoeat = require('mineflayer-auto-eat')
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node index.js <host> <port> [<name>] [<password>]')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3],
  username: process.argv[4],
  password: process.argv[5]
})


var stopFight = true

bot.loadPlugin(pathfinder)
bot.loadPlugin(autoeat)

bot.once('spawn', () => {

  const mcData = require('minecraft-data')(bot.version)

  const defaultMove = new Movements(bot, mcData)
  
  bot.on('chat', function(username, message) {
  
    if (username === bot.username) return

    const target = bot.players[username] ? bot.players[username].entity : null
    if (message === '$come') {

      if (!target) {
        bot.chat('I dont see you!')
        return
      }else
      {
        bot.chat('Ok!')
        const p = target.position

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
          return

      }

    }
    
    if(message === '$stop'){
      stopFight = true 
    }
    if(message === '$fight'){
      stopFight = false
    }
  })

})


  bot.once('spawn', () => {
    setInterval(() => {
    
        if (stopFight == false) {
            const mobFilter = e => e.type === 'mob' && (e.mobType === 'Zombie' || e.mobType === 'Skeleton' || e.mobType === 'Spider' || e.mobType === 'Creeper' || e.mobType === 'Slime' || e.mobType === 'Husk' || e.mobType === 'Drowned' || e.mobType === 'Enderman' || e.mobType === 'Zoglin' || e.mobType === 'Hoglin' || e.mobType === 'Piglin')
        const mob = bot.nearestEntity(mobFilter)
      if(!mob)
        return
      
      const botpos = bot.entity.position;
      const mobpos = mob.position;
      const pos = mob.position.offset(0, mob.height, 0)
      const x = Math.abs(botpos.x - mobpos.x)
  
        if(x <= 3 ) {
          bot.lookAt(pos, true, () => { })
          bot.attack(mob);
        }
      }
      
    }, 100);    
  });

  bot.on('spawn', () => {
    const totemId = bot.registry.itemsByName.totem_of_undying.id // Get the correct id
    if (bot.registry.itemsByName.totem_of_undying) {
      setInterval(() => {
        const totem = bot.inventory.findInventoryItem(totemId, null)
        if (totem) {
          bot.equip(totem, 'off-hand')
        }
      }, 50)
    }
  })

  bot.once('spawn', () => {
    bot.autoEat.options = {
      priority: 'foodPoints',
      startAt: 14,
      bannedFood: []
    }
  })
  bot.on('health', () => {
    if (bot.food === 20) bot.autoEat.disable()
    else bot.autoEat.enable()
  })
