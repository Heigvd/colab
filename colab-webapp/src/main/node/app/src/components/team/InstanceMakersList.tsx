/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import React from "react";
import useTranslations from "../../i18n/I18nContext";
import {useInstanceMakers, useUserByInstanceMaker} from "../../store/selectors/instanceMakerSelector";
import AvailabilityStatusIndicator from "../common/element/AvailabilityStatusIndicator";
import {css, cx} from "@emotion/css";
import {space_xs, text_xs, th_sm} from "../../styling/style";
import {InstanceMaker} from "colab-rest-client/dist/ColabClient";
import {useAppDispatch, useLoadingState} from "../../store/hooks";
import * as API from "../../API/api";
import {PendingUserName} from "./UserName";
import IconButton from "../common/element/IconButton";
import {ConfirmDeleteModal} from "../common/layout/ConfirmDeleteModal";
import {useIsCurrentTeamMemberOwner} from "../../store/selectors/teamMemberSelector";

interface InstanceMakerRowProps {
  instanceMaker: InstanceMaker;
}

function InstanceMakerRow({ instanceMaker }: InstanceMakerRowProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { status, user } = useUserByInstanceMaker(instanceMaker);

  const isCurrentMemberAnOwner: boolean = useIsCurrentTeamMemberOwner();

  const isPendingInvitation: boolean = user == null;

  const [showModal, setShowModal] = React.useState<boolean>(false);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const resetState = React.useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  const showDeleteModal = React.useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);

  const deleteInstanceMaker = React.useCallback(() => {
    startLoading();
    dispatch(API.deleteInstanceMaker(instanceMaker)).then(stopLoading);
  }, [dispatch, instanceMaker, startLoading, stopLoading]);

    const sendInvitation = React.useCallback(() => {
        if (instanceMaker.projectId && instanceMaker.displayName) {
            dispatch(
                API.shareModel({
                    projectId: instanceMaker.projectId,
                    recipient: instanceMaker.displayName,
                }),
            )
        }
    }, [dispatch, instanceMaker.projectId, instanceMaker.displayName])

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

    return (
        <tr>
            {showModal && (
                <ConfirmDeleteModal
                    title={i18n.team.deleteModelSharing}
                    message={<p>{i18n.team.sureDeleteModelSharing}</p>}
                    onCancel={resetState}
                    onConfirm={deleteInstanceMaker}
                    confirmButtonLabel={i18n.team.deleteModelSharing}
                    isConfirmButtonLoading={isLoading}
                />
            )}
            {user ? (
                <>
                    <>
                        <td>{user.commonname}</td>
                        <td>{user.firstname}</td>
                        <td>{user.lastname}</td>
                        <td>{user.affiliation}</td>
                    </>
                </>
            ) : (
                <>
                    <td>
                        <PendingUserName participant={instanceMaker}/>
                    </td>
                    <td/>
                    <td/>
                    <td/>
                </>
            )}
            <td className={css({display: 'flex', alignItems: 'center', justifyContent: 'flex-end'})}>
                {isPendingInvitation && (
                    <IconButton
                        icon="send"
                        title={i18n.team.actions.resendInvitation}
                        onClick={sendInvitation}
                        className={'hoverButton ' + css({visibility: 'hidden', padding: space_xs})}
                    />
                )}
                {(user == null /* a pending invitation can be deleted by anyone */ ||
                        isCurrentMemberAnOwner) /* verified users can only be deleted by an owner */ && (
                        <IconButton
                            icon="delete"
                            title={i18n.common.delete}
                            onClick={showDeleteModal}
                            className={'hoverButton ' + css({visibility: 'hidden', padding: space_xs})}
                        />
                    )}
            </td>


        </tr>
    )
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export default function InstanceMakersPanel(): React.ReactElement {
  const i18n = useTranslations();

  const { status, instanceMakers } = useInstanceMakers();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <div className={css({ overflow: 'auto', width: '100%', minWidth: '300px' })}>
      <table
        className={cx(
          text_xs,
          css({
            minWidth: '60%',
            textAlign: 'left',
            borderCollapse: 'collapse',
            'tbody tr:hover': {
              backgroundColor: 'var(--gray-100)',
            },
            'tr:hover .hoverButton': {
              pointerEvents: 'auto',
              visibility: 'visible',
            },
            td: {
              padding: 'space_sm',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }),
        )}
      >
        <thead
          className={css({
            position: 'sticky',
            top: 0,
            boxShadow: '0px 1px var(--divider-main)',
            zIndex: 1,
            background: 'var(--bg-secondary)',
          })}
        >
          <tr>
            <th className={th_sm}>{i18n.user.model.commonName}</th>
            <th className={th_sm}>{i18n.user.model.firstname}</th>
            <th className={th_sm}>{i18n.user.model.lastname}</th>
            <th className={th_sm}>{i18n.user.model.affiliation}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {instanceMakers.map(instanceMaker => (
            <InstanceMakerRow key={instanceMaker.id} instanceMaker={instanceMaker} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
