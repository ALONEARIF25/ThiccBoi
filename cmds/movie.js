import {
  SlashCommandBuilder,
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
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default {
  data: new SlashCommandBuilder()
    .setName("movie")
    .setDescription("Search for movies and TV series using TMDB")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The movie or TV series title to search for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Content type to search for")
        .setRequired(false)
        .addChoices(
          { name: "Movie", value: "movie" },
          { name: "TV Series", value: "tv" },
          { name: "Both", value: "multi" }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("Release year (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const movieTitle = interaction.options.getString("title");
      const contentType = interaction.options.getString("type") || "multi";
      const releaseYear = interaction.options.getInteger("year");

      let searchResults = [];

      // Search based on content type
      if (contentType === "movie") {
        let searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}`;
        if (releaseYear) {
          searchUrl += `&year=${releaseYear}`;
        }

        const response = await axios.get(searchUrl, {
          timeout: 10000,
          headers: { "User-Agent": "ThiccBoiBot/1.0" },
        });

        if (response.data.results && response.data.results.length > 0) {
          searchResults = response.data.results.map((item) => ({
            ...item,
            media_type: "movie",
          }));
        }
      } else if (contentType === "tv") {
        let searchUrl = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}`;
        if (releaseYear) {
          searchUrl += `&first_air_date_year=${releaseYear}`;
        }

        const response = await axios.get(searchUrl, {
          timeout: 10000,
          headers: { "User-Agent": "ThiccBoiBot/1.0" },
        });

        if (response.data.results && response.data.results.length > 0) {
          searchResults = response.data.results.map((item) => ({
            ...item,
            media_type: "tv",
          }));
        }
      } else {
        // Search both movies and TV shows
        const searchUrl = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          movieTitle
        )}`;

        const response = await axios.get(searchUrl, {
          timeout: 10000,
          headers: { "User-Agent": "ThiccBoiBot/1.0" },
        });

        if (response.data.results && response.data.results.length > 0) {
          // Filter to only movies and TV shows, exclude people
          searchResults = response.data.results.filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          );
        }
      }

      if (searchResults.length === 0) {
        const notFoundEmbed = new EmbedBuilder()
          .setTitle("🎬 Content Not Found")
          .setDescription(
            `Sorry, I couldn't find any ${
              contentType === "multi"
                ? "movies or TV series"
                : contentType === "tv"
                ? "TV series"
                : "movies"
            } matching "${movieTitle}"${
              releaseYear ? ` from ${releaseYear}` : ""
            }.`
          )
          .setColor(0xff4757)
          .setTimestamp();

        return await interaction.editReply({ embeds: [notFoundEmbed] });
      }

      // Get the first result
      const content = searchResults[0];
      const isMovie = content.media_type === "movie";
      const contentId = content.id;

      // Get detailed information
      const endpoint = isMovie ? "movie" : "tv";
      const detailsResponse = await axios.get(
        `${TMDB_BASE_URL}/${endpoint}/${contentId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`,
        {
          timeout: 10000,
          headers: { "User-Agent": "ThiccBoiBot/1.0" },
        }
      );

      const contentDetails = detailsResponse.data;

      // Create embed with all info in description to avoid field limits
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
          `${TMDB_IMAGE_BASE_URL}${contentDetails.poster_path}`
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
        // TV Series specific info
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
          basicInfo.push(
            `🎬 **${contentDetails.number_of_episodes} Episodes**`
          );
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
          // TV Series creators
          if (
            contentDetails.created_by &&
            contentDetails.created_by.length > 0
          ) {
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
        // TV Series specific info
        if (contentDetails.status) {
          description += `📊 **Status:** ${contentDetails.status}\n`;
        }
        if (contentDetails.networks && contentDetails.networks.length > 0) {
          description += `📡 **Network:** ${contentDetails.networks[0].name}`;
        }
      }

      contentEmbed.setDescription(description);

      // Create action buttons
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
        const imdbUrl = isMovie
          ? `https://www.imdb.com/title/${imdbId}`
          : `https://www.imdb.com/title/${imdbId}`;
        actionRow.addComponents(
          new ButtonBuilder()
            .setURL(imdbUrl)
            .setLabel("IMDb")
            .setStyle(ButtonStyle.Link)
            .setEmoji("🎬")
        );
      }

      // Cast button (custom ID for interaction)
      if (contentDetails.credits && contentDetails.credits.cast.length > 0) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(
              `cast_${contentDetails.id}_${isMovie ? "movie" : "tv"}`
            )
            .setLabel("Cast")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("👥")
        );
      }

      // Cover button (show backdrop image)
      if (contentDetails.backdrop_path) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(
              `cover_${contentDetails.id}_${isMovie ? "movie" : "tv"}`
            )
            .setLabel("Cover")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🖼️")
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
      console.error("Error fetching movie data:", error);

      let errorMessage =
        "Sorry, I couldn't fetch movie information right now. Please try again later!";

      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        errorMessage =
          "Unable to connect to TMDB. Please check your internet connection.";
      } else if (error.response && error.response.status === 401) {
        errorMessage =
          "API authentication failed. Please check the TMDB API key configuration.";
      } else if (error.response && error.response.status === 429) {
        errorMessage =
          "Too many requests. Please wait a moment before trying again.";
      }

      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Error")
        .setDescription(errorMessage)
        .setColor(0xff4757)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};
