import { ApplicationCommandOptionType } from "discord.js";
import { ISubcommand } from "../../../../utils/interfaces";
import Config from "../../../../models/configSchema";

const init = async ():Promise<ISubcommand|undefined>=>{
    try{
        return {
            isSubCommand:true,
            data:{
                name:"participation-role",
                description:"Sets role assigned to participants",
                type:ApplicationCommandOptionType.Subcommand,
                options:[{
                    name:"role",
                    description:"role to set",
                    type:ApplicationCommandOptionType.Role,
                    required:true
                }]
            },

            callback: async(client, interaction) => {
                try{
                    const role = interaction.options.getRole("role");
                    const guild = interaction.guild;

                    if (!role || !guild) {
                    await interaction.editReply({
                        content:
                        "⚠️ Invalid command. Please check your input and try again.",
                    });
                    return;
                    }

                    const updatedConfig = await Config.findOneAndUpdate(
                        {
                        serverID: guild.id,
                        },
                        { $set: { "raidConfig.participantRole": role.id } }
                    );

                    if (!updatedConfig) {
                        await interaction.editReply(
                            "🔍 This server could not be identified. Check if the bot has access."
                        );
                        return;
                    }

                    await interaction.editReply({
                        content: `✅ Guild raid participant role set to <@&${role.id}>`,
                    });    
                }
                catch(err){
                    console.error("Error in participation role subcommand callback : ",err);
                    return;
                }
            },
        }
    }
    catch(err){
    console.error("Error in raid participiation role set-up command : ",err);
    return undefined;
}};

export default init;