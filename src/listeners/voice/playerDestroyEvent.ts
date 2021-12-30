import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import { Client } from "discord.js";
import Set from "../../database/Manager/MusicManager";
import { ShoukakuPlayer } from "shoukaku";

@ApplyOptions<ListenerOptions>({
    name: "playerDestroy",
    emitter: "audioManager" as keyof Client,
    event: "playerDestroy"
})

export class playerDestroyEvent extends Listener {
    async run(name: string, shoukakuPlayer: ShoukakuPlayer) {
        const player = this.container.client.audioQueue.get(shoukakuPlayer.connection.guildId);
        console.log(`🔇 ${player.guild?.name}'s player destroyed`)

        if (player.message) player.message.delete().catch(() => null);
        if (player.timeout) clearTimeout(player.timeout);

        const lastEmbed = new MessageEmbed()
            .setTitle('No Music currently playing')
            .setDescription("[Commands](https://overtunes.me/commands) | [Invite](https://discord.com/oauth2/authorize?client_id=873101608467185684&scope=bot&permissions=4332047432&scope=applications.commands%20bot) | [Support](https://discord.gg/hM8U8cHtwu)")
            .setColor(player.guild?.me?.displayHexColor!)
            .setImage('https://cdn.discordapp.com/attachments/843462619158675487/890162871915393024/386720.jpeg')

        let stop = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('stop1')
            .setLabel('⏹')
            .setDisabled(true)

        let next = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('skip1')
            .setLabel('⏭️')
            .setDisabled(true)

        let pause = new MessageButton()
            .setCustomId('pause1')
            .setLabel('▶')
            .setStyle('PRIMARY')
            .setDisabled(true)

        let loop = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔁')
            .setCustomId('loop1')
            .setDisabled(true)

        let shuffle = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔀')
            .setCustomId('shuffle1')
            .setDisabled(true)

        let row = new MessageActionRow()
            .addComponents(stop)
            .addComponents(shuffle)
            .addComponents(pause)
            .addComponents(next)
            .addComponents(loop)

        const check = await Set.findOne({ Guild: player.guild.id });
        if (!player.text || player.text === null) return check.Channel = null, check.Message = null, check.save();
        if (!check || check.Channel === null || check.Message === null) return;

        player.text.messages.fetch(check.Message).catch(() => {
            check.Channel = null
            check.Message = null
            check.save()

            return player.text.send({
                embeds: [new MessageEmbed()
                    .setDescription('Template messages not found, back to normal mode')
                    .setColor('RED')
                ]
            })
        })

        player.text.messages.fetch(check.Message).then((x: Message) => {
            try {
                x.edit({ content: 'Join a voice channel then play something', embeds: [lastEmbed], components: [row] })
            } catch {
                return;
            }
        })
    }
}
