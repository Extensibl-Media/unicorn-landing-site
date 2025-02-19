export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliate_code_redemptions: {
        Row: {
          affiliate_code_id: number | null
          id: string
          profile_id: string | null
          redeemed_at: string | null
        }
        Insert: {
          affiliate_code_id?: number | null
          id?: string
          profile_id?: string | null
          redeemed_at?: string | null
        }
        Update: {
          affiliate_code_id?: number | null
          id?: string
          profile_id?: string | null
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_code_redemptions_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_code_redemptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_codes: {
        Row: {
          code: string
          created_at: string
          enabled: boolean
          id: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          enabled?: boolean
          id?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          enabled?: boolean
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_affiliate_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_reviews: {
        Row: {
          club_id: number
          created_at: string
          id: number
          rating: number
          review: string
          title: string | null
          user_id: string
        }
        Insert: {
          club_id: number
          created_at?: string
          id?: number
          rating: number
          review: string
          title?: string | null
          user_id: string
        }
        Update: {
          club_id?: number
          created_at?: string
          id?: number
          rating?: number
          review?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_reviews_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string | null
          city: string
          cover_image: string
          created_at: string
          description: string
          gallery_media: string[] | null
          geopoint: unknown | null
          hours_of_operation: Json
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          rating: number
          state: string
          total_reviews: number | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city: string
          cover_image: string
          created_at?: string
          description: string
          gallery_media?: string[] | null
          geopoint?: unknown | null
          hours_of_operation?: Json
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          rating?: number
          state: string
          total_reviews?: number | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          cover_image?: string
          created_at?: string
          description?: string
          gallery_media?: string[] | null
          geopoint?: unknown | null
          hours_of_operation?: Json
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          rating?: number
          state?: string
          total_reviews?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          archived_at: string | null
          conversation_id: string
          hide_messages_before: string | null
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          conversation_id: string
          hide_messages_before?: string | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          conversation_id?: string
          hide_messages_before?: string | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_previews"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_message_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_message_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_reviews: {
        Row: {
          created_at: string
          event_id: number
          id: number
          rating: number
          review: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          rating: number
          review: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          rating?: number
          review?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: number
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_event_rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          additional_info: string | null
          address: string
          all_day: boolean | null
          city: string
          club_id: number | null
          cover_image: string
          created_at: string
          date: string
          description: string
          end_time: string | null
          geopoint: unknown | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          parking_details: string | null
          sponsored_event: boolean
          start_time: string | null
          state: string
        }
        Insert: {
          additional_info?: string | null
          address: string
          all_day?: boolean | null
          city: string
          club_id?: number | null
          cover_image: string
          created_at?: string
          date: string
          description: string
          end_time?: string | null
          geopoint?: unknown | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          parking_details?: string | null
          sponsored_event?: boolean
          start_time?: string | null
          state: string
        }
        Update: {
          additional_info?: string | null
          address?: string
          all_day?: boolean | null
          city?: string
          club_id?: number | null
          cover_image?: string
          created_at?: string
          date?: string
          description?: string
          end_time?: string | null
          geopoint?: unknown | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          parking_details?: string | null
          sponsored_event?: boolean
          start_time?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_migrations: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          legacy_user_id: string
          migration_token: string
          new_user_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          legacy_user_id: string
          migration_token: string
          new_user_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          legacy_user_id?: string
          migration_token?: string
          new_user_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_migrations_legacy_user_id_fkey"
            columns: ["legacy_user_id"]
            isOneToOne: false
            referencedRelation: "legacy_users"
            referencedColumns: ["legacy_id"]
          },
        ]
      }
      legacy_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          lat: number | null
          legacy_id: string
          lon: number | null
          metadata: Json | null
          nickname: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          lat?: number | null
          legacy_id: string
          lon?: number | null
          metadata?: Json | null
          nickname: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          lat?: number | null
          legacy_id?: string
          lon?: number | null
          metadata?: Json | null
          nickname?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          have_connected: boolean
          id: number
          is_match: boolean
          user_a: string | null
          user_b: string | null
        }
        Insert: {
          created_at?: string
          have_connected?: boolean
          id?: number
          is_match?: boolean
          user_a?: string | null
          user_b?: string | null
        }
        Update: {
          created_at?: string
          have_connected?: boolean
          id?: number
          is_match?: boolean
          user_a?: string | null
          user_b?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_likes_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_likes_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          content_type: string
          created_at: string | null
          file_name: string
          height: number | null
          id: string
          message_id: string | null
          size_bytes: number
          storage_path: string
          type: Database["public"]["Enums"]["attachment_type"]
          width: number | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          file_name: string
          height?: number | null
          id?: string
          message_id?: string | null
          size_bytes: number
          storage_path: string
          type: Database["public"]["Enums"]["attachment_type"]
          width?: number | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          file_name?: string
          height?: number | null
          id?: string
          message_id?: string | null
          size_bytes?: number
          storage_path?: string
          type?: Database["public"]["Enums"]["attachment_type"]
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          has_attachments: boolean | null
          id: string
          is_edited: boolean | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          has_attachments?: boolean | null
          id?: string
          is_edited?: boolean | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          has_attachments?: boolean | null
          id?: string
          is_edited?: boolean | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_previews"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          created_at: string
          data: Json
          id: number
        }
        Insert: {
          created_at?: string
          data: Json
          id?: number
        }
        Update: {
          created_at?: string
          data?: Json
          id?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      posts_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_verification_requests: {
        Row: {
          created_at: string
          id: number
          status: Database["public"]["Enums"]["verification_status"]
          user_id: string
          verification_image: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          status?: Database["public"]["Enums"]["verification_status"]
          user_id: string
          verification_image: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          id?: number
          status?: Database["public"]["Enums"]["verification_status"]
          user_id?: string
          verification_image?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profile_verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          approved: boolean
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          completed_onboarding: boolean
          created_at: string
          email: string | null
          expo_push_token: string | null
          featured_expiry: string | null
          featured_user: boolean | null
          first_name: string | null
          geopoint: unknown | null
          hide_from_search: boolean
          id: string
          ideal_match: string | null
          interested_in: Database["public"]["Enums"]["match_interests"][] | null
          last_name: string | null
          latitude: number | null
          legacy_id: number | null
          lifestyle_experience: string | null
          location: string | null
          longitude: number | null
          looking_for: Database["public"]["Enums"]["profile_types"] | null
          onboarding_step: number | null
          personality_style: string[] | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          premium_user: boolean
          profile_type: Database["public"]["Enums"]["profile_types"] | null
          updated_at: string | null
          user_uploads: string[] | null
          username: string | null
          verified: boolean
        }
        Insert: {
          age?: number | null
          approved?: boolean
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          completed_onboarding?: boolean
          created_at?: string
          email?: string | null
          expo_push_token?: string | null
          featured_expiry?: string | null
          featured_user?: boolean | null
          first_name?: string | null
          geopoint?: unknown | null
          hide_from_search?: boolean
          id: string
          ideal_match?: string | null
          interested_in?:
            | Database["public"]["Enums"]["match_interests"][]
            | null
          last_name?: string | null
          latitude?: number | null
          legacy_id?: number | null
          lifestyle_experience?: string | null
          location?: string | null
          longitude?: number | null
          looking_for?: Database["public"]["Enums"]["profile_types"] | null
          onboarding_step?: number | null
          personality_style?: string[] | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          premium_user?: boolean
          profile_type?: Database["public"]["Enums"]["profile_types"] | null
          updated_at?: string | null
          user_uploads?: string[] | null
          username?: string | null
          verified?: boolean
        }
        Update: {
          age?: number | null
          approved?: boolean
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          completed_onboarding?: boolean
          created_at?: string
          email?: string | null
          expo_push_token?: string | null
          featured_expiry?: string | null
          featured_user?: boolean | null
          first_name?: string | null
          geopoint?: unknown | null
          hide_from_search?: boolean
          id?: string
          ideal_match?: string | null
          interested_in?:
            | Database["public"]["Enums"]["match_interests"][]
            | null
          last_name?: string | null
          latitude?: number | null
          legacy_id?: number | null
          lifestyle_experience?: string | null
          location?: string | null
          longitude?: number | null
          looking_for?: Database["public"]["Enums"]["profile_types"] | null
          onboarding_step?: number | null
          personality_style?: string[] | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          premium_user?: boolean
          profile_type?: Database["public"]["Enums"]["profile_types"] | null
          updated_at?: string | null
          user_uploads?: string[] | null
          username?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          content: string
          created_at: string
          helped_by_id: string
          id: number
          resolved: boolean
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          helped_by_id?: string
          id?: number
          resolved?: boolean
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          helped_by_id?: string
          id?: number
          resolved?: boolean
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_helped_by_id_fkey"
            columns: ["helped_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_by: string
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          blocked_by: string
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          blocked_by?: string
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_blocks_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_user_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications_enabled: boolean
          expo_push_token: string | null
          geolocation: Json | null
          id: number
          language: string | null
          match_distance_miles: number | null
          push_notifications_enabled: boolean
          search_distance_miles: number | null
          stealth_mode: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications_enabled?: boolean
          expo_push_token?: string | null
          geolocation?: Json | null
          id?: number
          language?: string | null
          match_distance_miles?: number | null
          push_notifications_enabled?: boolean
          search_distance_miles?: number | null
          stealth_mode?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications_enabled?: boolean
          expo_push_token?: string | null
          geolocation?: Json | null
          id?: number
          language?: string | null
          match_distance_miles?: number | null
          push_notifications_enabled?: boolean
          search_distance_miles?: number | null
          stealth_mode?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases_apple: {
        Row: {
          created_at: string
          entitlement: string
          id: string
          product_id: string
          receipt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement: string
          id?: string
          product_id: string
          receipt_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          entitlement?: string
          id?: string
          product_id?: string
          receipt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pru_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases_google: {
        Row: {
          created_at: string
          entitlement: string
          id: string
          product_id: string
          receipt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement: string
          id?: string
          product_id: string
          receipt_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          entitlement?: string
          id?: string
          product_id?: string
          receipt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_google_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          details: string | null
          id: number
          profile_id: string | null
          reason: string
          report_status: Database["public"]["Enums"]["report_status_types"]
          reported_by: string | null
        }
        Insert: {
          details?: string | null
          id?: never
          profile_id?: string | null
          reason: string
          report_status?: Database["public"]["Enums"]["report_status_types"]
          reported_by?: string | null
        }
        Update: {
          details?: string | null
          id?: never
          profile_id?: string | null
          reason?: string
          report_status?: Database["public"]["Enums"]["report_status_types"]
          reported_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_user_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      conversation_previews: {
        Row: {
          conversation_id: string | null
          has_unread_messages: boolean | null
          last_message_content: string | null
          last_message_has_attachments: boolean | null
          last_message_sender_id: string | null
          last_message_time: string | null
          last_read_at: string | null
          other_participants: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["last_message_sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_login: {
        Args: {
          admin_login_email: string
        }
        Returns: boolean
      }
      archive_conversation_for_user: {
        Args: {
          p_conversation_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      connect_match_and_create_conversation: {
        Args: {
          p_match_id: number
          p_current_user_id: string
          p_matched_user_id: string
        }
        Returns: string
      }
      delete_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: string
      }
      delete_conversation_for_user: {
        Args: {
          p_conversation_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      generate_slug: {
        Args: {
          title: string
        }
        Returns: string
      }
      get_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: Json
      }
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
      get_conversation_messages: {
        Args: {
          conversation_id: string
          page_size: number
          cursor_timestamp?: string
        }
        Returns: {
          id: string
          content: string
          sender_id: string
          created_at: string
          is_edited: boolean
          has_attachments: boolean
          has_more: boolean
        }[]
      }
      get_filtered_profiles: {
        Args: {
          user_id: string
          filter_type: Database["public"]["Enums"]["profile_filter_type"]
          search_radius_meters?: number
          days_ago?: number
          page_size?: number
          last_value?: string
          search_term?: string
        }
        Returns: {
          age: number | null
          approved: boolean
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          completed_onboarding: boolean
          created_at: string
          email: string | null
          expo_push_token: string | null
          featured_expiry: string | null
          featured_user: boolean | null
          first_name: string | null
          geopoint: unknown | null
          hide_from_search: boolean
          id: string
          ideal_match: string | null
          interested_in: Database["public"]["Enums"]["match_interests"][] | null
          last_name: string | null
          latitude: number | null
          legacy_id: number | null
          lifestyle_experience: string | null
          location: string | null
          longitude: number | null
          looking_for: Database["public"]["Enums"]["profile_types"] | null
          onboarding_step: number | null
          personality_style: string[] | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          premium_user: boolean
          profile_type: Database["public"]["Enums"]["profile_types"] | null
          updated_at: string | null
          user_uploads: string[] | null
          username: string | null
          verified: boolean
        }[]
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_nearby_clubs: {
        Args: {
          _target_lon: number
          _target_lat: number
          _distance: number
        }
        Returns: {
          id: number
          created_at: string
          name: string
          description: string
          gallery_media: string[]
          cover_image: string
          geopoint: unknown
          rating: number
          address: string
          city: string
          state: string
          hours_of_operation: Json
        }[]
      }
      get_profiles_for_like_me_game: {
        Args: {
          p_user_id: string
          p_latitude: number
          p_longitude: number
          p_radius_miles: number
          p_page: number
          p_batch_size: number
        }
        Returns: {
          id: string
          created_at: string
          username: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string
          latitude: number
          longitude: number
          profile_type: string
          age: number
          location: string
          verified: boolean
          featured_user: boolean
          hide_from_search: boolean
          featured_expiry: string
          premium_user: boolean
          approved: boolean
          distance: number
        }[]
      }
      get_user_conversation_previews: {
        Args: {
          user_id: string
        }
        Returns: {
          conversation_id: string
          updated_at: string
          last_message_content: string
          last_message_time: string
          last_message_sender_id: string
          last_message_has_attachments: boolean
          has_unread_messages: boolean
          other_participants: Json
        }[]
      }
      increment_post_views: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      insert_club: {
        Args: {
          _name: string
          _description: string
          _geopoint: string
          _address: string
          _city: string
          _state: string
          _rating?: number
          _gallery_media?: string[]
          _cover_image?: string
          _hours_of_operation?: Json
        }
        Returns: {
          address: string | null
          city: string
          cover_image: string
          created_at: string
          description: string
          gallery_media: string[] | null
          geopoint: unknown | null
          hours_of_operation: Json
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          rating: number
          state: string
          total_reviews: number | null
          website_url: string | null
        }[]
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_conversation_as_read: {
        Args: {
          p_conversation_id: string
          p_profile_id?: string
        }
        Returns: undefined
      }
      publish_post: {
        Args: {
          post_id: string
        }
        Returns: {
          author_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
      }
      search_nearby_clubs: {
        Args: {
          _target_lon: number
          _target_lat: number
          _distance: number
          _search_term: string
        }
        Returns: {
          id: number
          created_at: string
          name: string
          description: string
          gallery_media: string[]
          cover_image: string
          latitude: number
          longitude: number
          rating: number
          address: string
          city: string
          state: string
          hours_of_operation: Json
          distance: number
        }[]
      }
      search_nearby_events: {
        Args: {
          _target_lon: number
          _target_lat: number
          _distance: number
          _search_term: string
        }
        Returns: {
          id: number
          created_at: string
          name: string
          description: string
          date: string
          start_time: string
          end_time: string
          latitude: number
          longitude: number
          address: string
          city: string
          state: string
          club_id: number
          cover_image: string
          parking_details: string
          additional_info: string
          all_day: boolean
          sponsored_event: boolean
          distance: number
        }[]
      }
      set_claim: {
        Args: {
          uid: string
          claim: string
          value: Json
        }
        Returns: string
      }
      unaccent: {
        Args: {
          "": string
        }
        Returns: string
      }
      unaccent_init: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      unarchive_conversation_for_user: {
        Args: {
          p_conversation_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      attachment_type: "image" | "file"
      match_interests: "UNICORNS" | "COUPLES" | "FRIENDS"
      message_status: "READ" | "UNREAD"
      post_status: "draft" | "published" | "archived"
      profile_filter_type: "ALL" | "NEARBY" | "NEWLY_REGISTERED" | "FEATURED"
      profile_types: "COUPLE" | "UNICORN"
      report_status_types: "PENDING" | "RESOLVED" | "CLOSED"
      verification_status: "PENDING" | "APPROVED" | "DENIED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
