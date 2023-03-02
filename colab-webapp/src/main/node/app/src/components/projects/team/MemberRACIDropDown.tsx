import { css, cx } from "@emotion/css";
import { InvolvementLevel, TeamMember } from "colab-rest-client";
import React from "react";
import * as API from '../../../API/api';
import logger from "../../../logger";
import { CardAcl } from "../../../selectors/cardSelector";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import DropDownMenu from "../../common/layout/DropDownMenu";
import Flex from "../../common/layout/Flex";
import Icon from "../../common/layout/Icon";
import { heading_md, iconButtonStyle, ghostIconButtonStyle } from "../../styling/style";

const DEFAULT_RIGHT = 'INFORMED_READWRITE';
function labelPrettyPrint(level?: InvolvementLevel) {
  switch (level) {
    case 'RESPONSIBLE':
      return 'R (Responsible)';
    case 'ACCOUNTABLE':
      return 'A (Accountable)';
    case 'CONSULTED_READWRITE':
      return 'C (Consulted)';
    case 'INFORMED_READWRITE':
      return 'I (Informed)';
    case 'OUT_OF_THE_LOOP':
      return 'Access denied';
    default:
      return 'None';
  }
}
function buttonPrettyPrint(level?: InvolvementLevel) {
  switch (level) {
    case 'RESPONSIBLE':
      return 'R';
    case 'ACCOUNTABLE':
      return 'A';
    case 'CONSULTED_READWRITE':
      return 'C';
    case 'INFORMED_READWRITE':
      return 'I';
    case 'OUT_OF_THE_LOOP':
      return <Icon icon={'block'} />;
    default:
      return <Icon icon={'remove'} />;
  }
}
function buildOption(level?: InvolvementLevel) {
  return {
    value: level ? level : DEFAULT_RIGHT,
    label: level ? labelPrettyPrint(level) : labelPrettyPrint(DEFAULT_RIGHT),
  };
}

const options = [
  buildOption('RESPONSIBLE'),
  buildOption('ACCOUNTABLE'),
  buildOption('CONSULTED_READWRITE'),
  buildOption('INFORMED_READWRITE'),
  buildOption('OUT_OF_THE_LOOP'),
  //buildOption(),
];

export default function MemberACLDropDown({ member, acl }: { member: TeamMember; acl: CardAcl }): JSX.Element {
  const self = acl.self.members[member.id || -1];
  //const effective: InvolvementLevel[] | undefined = acl.effective.members[member.id || -1];
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => {
    if (member.userId != null) {
      return state.users.users[member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  const onChange = React.useCallback(
    (value: InvolvementLevel | null) => {
      logger.info('New role level: ', value);
      if (member.id != null && acl.status.cardId != null) {
        if (value != null) {
          dispatch(
            API.setMemberInvolvement({
              memberId: member.id,
              involvement: value,
              cardId: acl.status.cardId,
            }),
          );
        } else {
          dispatch(API.clearMemberInvolvement({ memberId: member.id, cardId: acl.status.cardId }));
        }
      }
    },
    [acl.status.cardId, member.id, dispatch],
  );
  const onChangeCb = React.useCallback(
    (option: { value: InvolvementLevel } | null) => {
      if (option != null) {
        onChange(option.value);
      } else {
        onChange(null);
      }
    },
    [onChange],
  );

  React.useEffect(() => {
    if (member.userId != null && user === undefined) {
      // member is linked to a user. This user is not yet known
      // load it
      dispatch(API.getUser(member.userId));
    }
  }, [member.userId, user, dispatch]);

  return (
    <Flex direction='column' align="stretch">
      <DropDownMenu
        value={buildOption(self).value}
        valueComp={buildOption(self)}
        entries={options}
        onSelect={entry => onChangeCb(entry)}
        className={css({ alignItems: 'stretch' })}
        buttonLabel={buttonPrettyPrint(self) }
        buttonClassName={cx(heading_md, iconButtonStyle, ghostIconButtonStyle, css({justifyContent: 'center', lineHeight: '24px', color: 'var(--primary-main)'}))}
      />
    </Flex>
  );
}
