/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import { CirclePicker } from 'react-color';
import useTranslations from '../../i18n/I18nContext';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { MaterialIconsType } from '../styling/IconType';
import { labelStyle, space_lg, space_md, space_sm, space_xs } from '../styling/style';
import { projectColors } from '../styling/theme';
import { defaultProjectIllustration } from './ProjectCommon';

interface ProjectIllustrationMakerProps {
  illustration: Illustration | undefined | null;
  setIllustration: (i: Illustration) => void;
  iconContainerClassName?: string;
  colorContainerClassName?: string;
  className?: string;
}

const projectIcons: MaterialIconsType[] = [
  'gamepad',
  'favorite',
  'casino',
  'extension',
  'bug_report',
  'robot',
  'school',
  'music_note',
  'smart_toy',
  'stadia_controller',
  'clear_day',
  'menu_book',
  'water_drop',
  'history_edu',
  'bolt',
  'language',
  'recycling',
  'public',
  'forest',
  'coronavirus',
  'medication',
  'skeleton',
  'nutrition',
  'stethoscope',
  'accessible_forward',
  'palette',
  'landscape',
  'savings',
  'domain',
  'trolley',
  'fire_truck',
  'accessibility_new',
  'account_circle',
  'alarm',
  'analytics',
  'anchor',
  'assignment',
  'balance',
  'batch_prediction',
  'card_giftcard',
  'card_travel',
  'change_history',
  'commute',
  'contact_page',
  'dangerous',
  'face_unlock',
  'favorite_border',
  'fingerprint',
  'flutter_dash',
  'gavel',
  'group_work',
  'invert_colors',
  'language',
  'leaderboard',
  'loyalty',
  'nightlight_round',
  'opacity',
  'pan_tool',
  'perm_contact_calendar',
  'pets',
  'pregnant_woman',
  'print',
  'report_problem',
  'rocket',
  'rocket_launch',
  'room',
  'rowing',
  'satellite_alt',
  'savings',
  'sensors',
  'settings_input_component',
  'settings_input_hdmi',
  'settings_input_svideo',
  'shopping_bag',
  'shopping_basket',
  'shopping_cart',
  'smart_button',
  'source',
  'sticky_note_2',
  'store',
  'supervised_user_circle',
  'support',
  'thumb_up',
  'thumb_down',
  'thumbs_up_down',
  'timeline',
  'tips_and_updates',
  'today',
  'toc',
  'token',
  'tour',
  'track_changes',
  'trending_down',
  'trending_flat',
  'trending_up',
  'try',
  'turned_in',
  'unfold_more_double',
  'verified',
  'view_in_ar',
  'view_kanban',
  'visibility',
  'visibility_off',
  'watch_later',
  'work',
  'error',
  'art_track',
  'equalizer',
  'library_music',
  'mic',
  'speed',
  'business',
  'dialpad',
  'hub',
  'key',
  'message',
  'rtt',
  'sentiment_satisfied_alt',
  'vpn_key',
  'attribution',
  'biotech',
  'block',
  'content_cut',
  'flag',
  'drafts',
  'gesture',
  'insights',
  'inventory_2',
  'push_pin',
  'send',
  'tag',
  'waves',
  'upcoming',
  'stream',
  'square_foot',
  'shield',
  'weekend',
  'airplanemode_active',
  'air',
  'bloodtype',
  'battery_charging_full',
  'brightness_high',
  'brightness_low',
  'cable',
  'data_saver_off',
  'device_thermostat',
  'devices',
  'flashlight_on',
  'fluorescent',
  'graphic_eq',
  'grid_3x3',
  'grid_4x4',
  'grid_goldenratio',
  'lens_blur',
  'macro_off',
  'light_mode',
  'mode_night',
  'medication',
  'password',
  'pattern',
  'phishing',
  'pin',
  'punch_clock',
  'radar',
  'remember_me',
  'reviews',
  'sell',
  'settings_suggest',
  'settings_system_daydream',
  'signal_cellular_4_bar',
  'sports_score',
  'ssid_chart',
  'storage',
  'storm',
  'summarize',
  'tungsten',
  'usb',
  'wallpaper',
  'water',
  'wifi_channel',
  'area_chart',
  'attach_file',
  'attach_money',
  'border_color',
  'bubble_chart',
  'draw',
  'format_paint',
  'format_quote',
  'functions',
  'hexagon',
  'highlight',
  'line_axis',
  'folder',
  'workspaces',
  'desktop_windows',
  'earbuds',
  'headset_mic',
  'keyboard',
  'keyboard_command_key',
  'laptop_mac',
  'memory',
  'mouse',
  'point_of_sale',
  'scanner',
  'security',
  'toys',
  'watch',
  'tablet_android',
  'heat_pump',
  'solar_power',
  'nest_cam_wired_stand',
  'propane',
  'propane_tank',
  'sensor_door',
  'animation',
  'assistant_photo',
  'auto_awesome',
  'blur_circular',
  'camera_roll',
  'color_lens',
  'colorize',
  'collections',
  'details',
  'deblur',
  'filter_center_focus',
  'filter_vintage',
  'filter_drama',
  'filter_hdr',
  'filter_frames',
  'flare',
  'gradient',
  'grain',
  'hdr_strong',
  'hdr_weak',
  'healing',
  'incomplete_circle',
  'leak_add',
  'mic_external_on',
  'palette',
  'movie_creation',
  'movie_filter',
  'nature_people',
  'nature',
  'shutter_speed',
  'straighten',
  'style',
  'texture',
  'timelapse',
  'wb_shade',
  'wb_twilight',
  'agriculture',
  'airlines',
  'attractions',
  'bakery_dining',
  'bike_scooter',
  'breakfast_dining',
  'brunch_dining',
  'castle',
  'category',
  'celebration',
  'connecting_airports',
  'crisis_alert',
  'diamond',
  'dinner_dining',
  'directions_bike',
  'directions_boat',
  'directions_bus',
  'directions_car',
  'directions_railway',
  'directions_run',
  'directions_walk',
  'edit_road',
  'egg',
  'egg_alt',
  'emergency',
  'factory',
  'fastfood',
  'festival',
  'fire_hydrant',
  'flight',
  'forest',
  'fort',
  'hail',
  'handyman',
  'hardware',
  'hotel',
  'icecream',
  'kebab_dining',
  'liquor',
  'local_bar',
  'local_cafe',
  'local_dining',
  'local_drink',
  'local_florist',
  'local_pizza',
  'local_police',
  'local_printshop',
  'local_shipping',
  'local_taxi',
  'lunch_dining',
  'nightlife',
  'moving',
  'minor_crash',
  'park',
  'ramen_dining',
  'restaurant',
  'sailing',
  'set_meal',
  'signpost',
  'snowmobile',
  'stadium',
  'synagogue',
  'temple_buddhist',
  'temple_hindu',
  'church',
  'mosque',
  'theater_comedy',
  'traffic',
  'train',
  'volunteer_activism',
  'wine_bar',
  'campaign',
  'cancel',
  'home_work',
  'waterfall_chart',
  'airline_seat_recline_extra',
  'imagesearch_roller',
  'more',
  'support_agent',
  'wc',
  'ac_unit',
  'all_inclusive',
  'cabin',
  'checkroom',
  'bathtub',
  'beach_access',
  'child_friendly',
  'cottage',
  'family_restroom',
  'fitness_center',
  'golf_course',
  'grass',
  'hot_tub',
  'kitchen',
  'pool',
  'room_service',
  'tapas',
  'umbrella',
  'wash',
  'bed',
  'blender',
  'light',
  'yard',
  'architecture',
  'back_hand',
  'blind',
  'cake',
  'cookie',
  'cruelty_free',
  'deck',
  'diversity_1',
  'downhill_skiing',
  'emoji_food_beverage',
  'emoji_nature',
  'emoji_objects',
  'engineering',
  'face_2',
  'face_3',
  'face_4',
  'face_6',
  'fireplace',
  'flood',
  'hiking',
  'history_edu',
  'hive',
  'ice_skating',
  'military_tech',
  'outdoor_grill',
  'paragliding',
  'precision_manufacturing',
  'personal_injury',
  'public',
  'scale',
  'science',
  'skateboarding',
  'sports_martial_arts',
  'thunderstorm',
];

export function ProjectIllustrationMaker({
  illustration,
  setIllustration,
  iconContainerClassName,
  colorContainerClassName,
  className,
}: ProjectIllustrationMakerProps): JSX.Element {
  const i18n = useTranslations();
  const illustrationCurrent = illustration ? illustration : defaultProjectIllustration;
  return (
    <Flex direction="column" align="stretch" className={className}>
      <Flex direction="column">
        <label className={labelStyle}>{i18n.modules.project.settings.currentIcon}</label>
        <Icon
          color="var(--white)"
          icon={illustrationCurrent.iconKey as MaterialIconsType}
          opsz={'lg'}
          className={css({
            padding: space_md,
            backgroundColor: illustrationCurrent.iconBkgdColor,
            borderRadius: '5px',
            margin: space_xs,
          })}
        />
      </Flex>

      <div className={cx(css({ marginTop: space_sm }), colorContainerClassName)}>
        <label className={labelStyle}>{i18n.modules.card.settings.color}</label>

        <CirclePicker
          colors={Object.values(projectColors)}
          onChangeComplete={c => setIllustration({ ...illustrationCurrent, iconBkgdColor: c.hex })}
          color={illustrationCurrent.iconBkgdColor}
          width={'auto'}
          className={css({ marginTop: space_sm, padding: space_sm })}
        />
      </div>
      <Flex direction="column" className={cx(css({ marginTop: space_sm }))}>
        <label className={labelStyle}>{i18n.modules.project.settings.icon}</label>

        <ProjectIconPicker
          bgColor={illustrationCurrent.iconBkgdColor}
          iconActive={illustrationCurrent.iconKey}
          onChange={i => setIllustration({ ...illustrationCurrent, iconKey: i })}
          className={iconContainerClassName}
        />
      </Flex>
    </Flex>
  );
}

interface ProjectIconPickerProps {
  bgColor: string;
  iconActive: string;
  onChange: (icon: MaterialIconsType) => void;
  className?: string;
}
function ProjectIconPicker({
  bgColor,
  iconActive,
  onChange,
  className,
}: ProjectIconPickerProps): JSX.Element {
  return (
    <>
      <div
        className={cx(
          css({
            display: 'flex',
            flexWrap: 'wrap',
            padding: `0 ${space_lg} 0 0`,
            maxHeight: '340px',
            overflow: 'auto',
            cursor: 'default',
            minWidth: '200px',
            marginTop: space_lg,
            marginRight: space_lg,

            /*
            gridGap: space_md,
            gridTemplateColumns: 'repeat(auto-fit, 50px)', 
            backgroundColor: bgColor,
            */
          }),
          className,
        )}
      >
        {projectIcons.map(i => (
          <IconButton
            key={i}
            title={i}
            icon={i}
            iconSize={'md'}
            onClick={() => onChange(i)}
            //variant='ghost'
            className={css({
              margin: space_xs,
              color: iconActive === i ? bgColor : 'var(--bg-primary)',
              backgroundColor: iconActive === i ? 'transparent' : bgColor,
              border: iconActive === i ? `3px solid ${bgColor}` : `3px solid transparent`,
              ':not(:disabled):hover': {
                backgroundColor: `${bgColor}`,
                color: 'var(--white)',
                opacity: 0.5,
              },
            })}
          />
        ))}
      </div>
    </>
  );
}
