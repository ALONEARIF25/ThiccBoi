import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300"; // Medium size for better quality

export async function handleCastButton(interaction) {
  try {
    await interaction.deferUpdate();

    // Parse the custom ID to get content ID and type
    const [, contentId, contentType] = interaction.customId.split("_");
    const isMovie = contentType === "movie";
    const endpoint = isMovie ? "movie" : "tv";

    // Get detailed cast information
    const response = await axios.get(
      `${TMDB_BASE_URL}/${endpoint}/${contentId}/credits?api_key=${TMDB_API_KEY}`,
      {
        timeout: 10000,
        headers: { "User-Agent": "ThiccBoiBot/1.0" },
      }
    );

    const credits = response.data;
    const cast = credits.cast.filter((actor) => actor.profile_path); // Only include actors with photos

    if (cast.length === 0) {
      const noCastEmbed = new EmbedBuilder()
        .setTitle("👥 Cast Information")
        .setDescription("No cast photos available for this content.")
        .setColor(0xff4757)
        .setTimestamp();

      return await interaction.editReply({ embeds: [noCastEmbed] });
    }

    // Show first cast member (page 0)
    await showCastPage(interaction, cast, 0, contentId, contentType, isMovie);
  } catch (error) {
    console.error("Error fetching cast data:", error);

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription("Sorry, I couldn't fetch cast information right now.")
      .setColor(0xff4757)
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

async function showCastPage(
  interaction,
  cast,
  currentPage,
  contentId,
  contentType,
  isMovie
) {
  const actor = cast[currentPage];

  // Create cast embed for current actor
  const castEmbed = new EmbedBuilder()
    .setTitle(`👥 Cast Member ${currentPage + 1} of ${cast.length}`)
    .setColor(isMovie ? 0xf39c12 : 0x9b59b6)
    .setTimestamp();

  // Actor info
  castEmbed.addFields(
    { name: "🎭 Actor", value: actor.name, inline: true },
    { name: "👤 Character", value: actor.character || "Unknown", inline: true },
    {
      name: "📊 Popularity",
      value: actor.popularity ? actor.popularity.toFixed(1) : "N/A",
      inline: true,
    }
  );

  // Add profile image
  if (actor.profile_path) {
    castEmbed.setImage(`${TMDB_IMAGE_BASE_URL}${actor.profile_path}`);
  }

  // Create navigation buttons
  const navigationRow = new ActionRowBuilder();

  // Previous button
  if (currentPage > 0) {
    navigationRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`cast_prev_${contentId}_${contentType}_${currentPage}`)
        .setLabel("◀ Previous")
        .setStyle(ButtonStyle.Primary)
    );
  }

  // Page indicator button (disabled)
  navigationRow.addComponents(
    new ButtonBuilder()
      .setCustomId("page_indicator")
      .setLabel(`${currentPage + 1}/${cast.length}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );

  // Next button
  if (currentPage < cast.length - 1) {
    navigationRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`cast_next_${contentId}_${contentType}_${currentPage}`)
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Primary)
    );
  }

  // Back to main info button
  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`back_${contentId}_${contentType}`)
      .setLabel("← Back to Info")
      .setStyle(ButtonStyle.Success)
  );

  const components = [navigationRow];
  if (navigationRow.components.length > 0) {
    components.push(backRow);
  }

  await interaction.editReply({
    embeds: [castEmbed],
    components: components,
  });
}

export async function handleCastNavigation(interaction) {
  try {
    await interaction.deferUpdate();

    // Parse the custom ID
    const parts = interaction.customId.split("_");
    const direction = parts[1]; // 'prev' or 'next'
    const contentId = parts[2];
    const contentType = parts[3];
    const currentPage = parseInt(parts[4]);
    const isMovie = contentType === "movie";
    const endpoint = isMovie ? "movie" : "tv";

    // Get cast data again
    const response = await axios.get(
      `${TMDB_BASE_URL}/${endpoint}/${contentId}/credits?api_key=${TMDB_API_KEY}`,
      {
        timeout: 10000,
        headers: { "User-Agent": "ThiccBoiBot/1.0" },
      }
    );

    const credits = response.data;
    const cast = credits.cast.filter((actor) => actor.profile_path);

    // Calculate new page
    let newPage = currentPage;
    if (direction === "next" && currentPage < cast.length - 1) {
      newPage = currentPage + 1;
    } else if (direction === "prev" && currentPage > 0) {
      newPage = currentPage - 1;
    }

    // Show the new page
    await showCastPage(
      interaction,
      cast,
      newPage,
      contentId,
      contentType,
      isMovie
    );
  } catch (error) {
    console.error("Error navigating cast:", error);

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription("Sorry, I couldn't navigate the cast list.")
      .setColor(0xff4757)
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

export async function handleBackButton(interaction) {
  try {
    await interaction.deferUpdate();

    // Parse the custom ID to get content ID and type
    const [, contentId, contentType] = interaction.customId.split("_");
    const isMovie = contentType === "movie";
    const endpoint = isMovie ? "movie" : "tv";

    // Re-fetch the original content details
    const detailsResponse = await axios.get(
      `${TMDB_BASE_URL}/${endpoint}/${contentId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`,
      {
        timeout: 10000,
        headers: { "User-Agent": "ThiccBoiBot/1.0" },
      }
    );

    const contentDetails = detailsResponse.data;

    // Recreate the original embed (same logic as in movie.js)
    const contentEmbed = new EmbedBuilder()
      .setTitle(
        `${isMovie ? "🎬" : "📺"} ${
          isMovie ? contentDetails.title : contentDetails.name
        }`
      )
      .setColor(isMovie ? 0xf39c12 : 0x9b59b6)
      .setTimestamp();

    // Add thumbnail
    if (contentDetails.poster_path) {
      contentEmbed.setThumbnail(
        `https://image.tmdb.org/t/p/w500${contentDetails.poster_path}`
      );
    }

    // Build comprehensive description
    let description = "";

    // Overview
    if (contentDetails.overview) {
      description +=
        contentDetails.overview.length > 200
          ? contentDetails.overview.substring(0, 197) + "..."
          : contentDetails.overview;
      description += "\n\n";
    }

    // Basic info
    const basicInfo = [];

    if (isMovie) {
      if (contentDetails.release_date) {
        basicInfo.push(
          `📅 **${new Date(contentDetails.release_date).getFullYear()}**`
        );
      }
      if (contentDetails.runtime) {
        const hours = Math.floor(contentDetails.runtime / 60);
        const minutes = contentDetails.runtime % 60;
        basicInfo.push(`⏱️ **${hours}h ${minutes}m**`);
      }
    } else {
      if (contentDetails.first_air_date) {
        basicInfo.push(
          `📅 **${new Date(contentDetails.first_air_date).getFullYear()}**`
        );
      }
      if (contentDetails.number_of_seasons) {
        basicInfo.push(
          `📺 **${contentDetails.number_of_seasons} Season${
            contentDetails.number_of_seasons > 1 ? "s" : ""
          }**`
        );
      }
      if (contentDetails.number_of_episodes) {
        basicInfo.push(`🎬 **${contentDetails.number_of_episodes} Episodes**`);
      }
      if (
        contentDetails.episode_run_time &&
        contentDetails.episode_run_time.length > 0
      ) {
        basicInfo.push(`⏱️ **~${contentDetails.episode_run_time[0]}min/ep**`);
      }
    }

    if (contentDetails.vote_average) {
      basicInfo.push(`⭐ **${contentDetails.vote_average.toFixed(1)}/10**`);
    }

    if (basicInfo.length > 0) {
      description += basicInfo.join(" • ") + "\n\n";
    }

    // Genres
    if (contentDetails.genres && contentDetails.genres.length > 0) {
      description += `🎭 **Genres:** ${contentDetails.genres
        .map((g) => g.name)
        .join(", ")}\n`;
    }

    // Creator/Director and Cast
    if (contentDetails.credits) {
      if (isMovie) {
        const director = contentDetails.credits.crew.find(
          (p) => p.job === "Director"
        );
        if (director) {
          description += `🎬 **Director:** ${director.name}\n`;
        }
      } else {
        if (contentDetails.created_by && contentDetails.created_by.length > 0) {
          description += `🎬 **Created by:** ${contentDetails.created_by
            .map((c) => c.name)
            .join(", ")}\n`;
        }
      }

      const cast = contentDetails.credits.cast.slice(0, 4).map((a) => a.name);
      if (cast.length > 0) {
        description += `🎭 **Cast:** ${cast.join(", ")}\n`;
      }
    }

    // Financial info (movies only)
    if (isMovie) {
      if (contentDetails.budget && contentDetails.budget > 0) {
        description += `💰 **Budget:** $${(
          contentDetails.budget / 1000000
        ).toFixed(0)}M `;
      }
      if (contentDetails.revenue && contentDetails.revenue > 0) {
        description += `💵 **Revenue:** $${(
          contentDetails.revenue / 1000000
        ).toFixed(0)}M`;
      }
    } else {
      if (contentDetails.status) {
        description += `📊 **Status:** ${contentDetails.status}\n`;
      }
      if (contentDetails.networks && contentDetails.networks.length > 0) {
        description += `📡 **Network:** ${contentDetails.networks[0].name}`;
      }
    }

    contentEmbed.setDescription(description);

    // Recreate action buttons
    const actionRow = new ActionRowBuilder();

    actionRow.addComponents(
      new ButtonBuilder()
        .setURL(
          `https://www.themoviedb.org/${isMovie ? "movie" : "tv"}/${
            contentDetails.id
          }`
        )
        .setLabel("TMDB")
        .setStyle(ButtonStyle.Link)
        .setEmoji("🔗")
    );

    if (
      contentDetails.imdb_id ||
      (contentDetails.external_ids && contentDetails.external_ids.imdb_id)
    ) {
      const imdbId =
        contentDetails.imdb_id || contentDetails.external_ids.imdb_id;
      actionRow.addComponents(
        new ButtonBuilder()
          .setURL(`https://www.imdb.com/title/${imdbId}`)
          .setLabel("IMDb")
          .setStyle(ButtonStyle.Link)
          .setEmoji("🎬")
      );
    }

    // Cast button
    if (contentDetails.credits && contentDetails.credits.cast.length > 0) {
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`cast_${contentDetails.id}_${isMovie ? "movie" : "tv"}`)
          .setLabel("Cast")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("👥")
      );
    }

    // Trailer
    if (contentDetails.videos && contentDetails.videos.results.length > 0) {
      const trailer = contentDetails.videos.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      if (trailer) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setURL(`https://www.youtube.com/watch?v=${trailer.key}`)
            .setLabel("Trailer")
            .setStyle(ButtonStyle.Link)
            .setEmoji("▶️")
        );
      }
    }

    contentEmbed.setFooter({
      text: `Powered by TMDB | ${isMovie ? "Movie" : "TV Series"} ID: ${
        contentDetails.id
      }`,
      iconURL: "https://cdn.discordapp.com/emojis/1388767540657782796.gif",
    });

    await interaction.editReply({
      embeds: [contentEmbed],
      components: actionRow.components.length > 0 ? [actionRow] : [],
    });
  } catch (error) {
    console.error("Error returning to main info:", error);

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription("Sorry, I couldn't return to the main information.")
      .setColor(0xff4757)
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

export async function handleCoverButton(interaction) {
  try {
    await interaction.deferUpdate();

    // Parse the custom ID to get content ID and type
    const [, contentId, contentType] = interaction.customId.split("_");
    const isMovie = contentType === "movie";
    const endpoint = isMovie ? "movie" : "tv";

    // Get content details to fetch backdrop
    const response = await axios.get(
      `${TMDB_BASE_URL}/${endpoint}/${contentId}?api_key=${TMDB_API_KEY}`,
      {
        timeout: 10000,
        headers: { "User-Agent": "ThiccBoiBot/1.0" },
      }
    );

    const contentDetails = response.data;

    if (!contentDetails.backdrop_path) {
      const noCoverEmbed = new EmbedBuilder()
        .setTitle("🖼️ Cover Image")
        .setDescription("No cover image available for this content.")
        .setColor(0xff4757)
        .setTimestamp();

      return await interaction.editReply({ embeds: [noCoverEmbed] });
    }

    // Create cover embed with backdrop image (using same method as thicc.js)
    const backdropUrl = `https://media.themoviedb.org/t/p/w1280${contentDetails.backdrop_path}`;

    const coverEmbed = new EmbedBuilder()
      .setTitle(
        `🖼️ ${isMovie ? contentDetails.title : contentDetails.name} - Cover`
      )
      .setImage(backdropUrl)
      .setColor(isMovie ? 0xf39c12 : 0x9b59b6)
      .setTimestamp();

    // Add back button
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`back_${contentId}_${contentType}`)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️")
    );

    await interaction.editReply({
      embeds: [coverEmbed],
      components: [actionRow],
    });

    console.log(
      `✅ Cover image displayed for ${
        isMovie ? contentDetails.title : contentDetails.name
      }`
    );
  } catch (error) {
    console.error("Error showing cover image:", error);

    const errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription("Sorry, I couldn't display the cover image.")
      .setColor(0xff4757)
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
