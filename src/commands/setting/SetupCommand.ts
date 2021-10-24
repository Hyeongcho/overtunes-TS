import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message, MessageEmbed, MessageButton, MessageActionRow } from "discord.js";
import music from "../../database/Manager/MusicManager";

@ApplyOptions<CommandOptions>({
    name: "setup",
    requiredUserPermissions: ["MANAGE_GUILD"],
    cooldownDelay: 30000,
    cooldownLimit: 2
})

export class SetupCommand extends Command {
    async messageRun(msg: Message) {
        const data = await music.findOne({ Guild: msg.guildId });

        const pl = new MessageEmbed()
            .setTitle('No Music currently playing')
            .setColor(msg.guild?.me?.displayHexColor!)
            .setImage('https://cdn.discordapp.com/attachments/843462619158675487/890162871915393024/386720.jpeg')

        let first = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('back1')
            .setLabel('⏮️')

        let next = new MessageButton()
            .setStyle('PRIMARY')
            .setCustomId('skip1')
            .setLabel('⏭️')

        let pause = new MessageButton()
            .setCustomId('pause1')
            .setLabel('▶')
            .setStyle('PRIMARY')

        let loop = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔁')
            .setCustomId('loop1')


        let shuffle = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('🔀')
            .setCustomId('shuffle1')

        let row = new MessageActionRow()
            .addComponents(shuffle)
            .addComponents(first)
            .addComponents(pause)
            .addComponents(next)
            .addComponents(loop)

        msg.guild?.channels.create(`${this.container.client.user?.username}-music-request`, {
            type: "GUILD_TEXT",
        }).then(async (x) => {
            const react = await x.send({ content: 'Join a voice channel then play something', embeds: [pl], components: [row] })
            data.Channel = x.id
            data.Message = react.id
            data.save();

            msg.channel.send({
                embeds: [new MessageEmbed()
                    .setDescription(`Music request channel has been created, Channel <#${x.id}>.\n\nMy [commands](https://overtunes.netlify.app/docs/basic-use/commands/) will only work in <#${x.id}> from now on.`)
                    .setColor(msg.guild?.me?.displayHexColor!)
                ]
            })
        })
    }
}