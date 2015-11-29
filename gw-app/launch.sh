#!/bin/sh

while read LINE; do
    # Device Name
    DEVNAME=`echo ${LINE} | cut -d , -f 2`
    if [ `echo "${DEVNAME}" | grep 'dev'` ] ; then
        echo "${DEVNAME}"
        while read LINE1; do
            DEV=`echo ${LINE1} | cut -d , -f 1`
            BLE=`echo ${LINE1} | cut -d , -f 2`
            #echo "${BLE}"
            if [ `echo "${DEVNAME}" | grep "${DEV}"` ] ; then
                echo "${BLE}"
                node gateway.js "${DEVNAME}" "${BLE}" >> gateway.log&
                echo $! > ${DEVNAME}.pid
            fi
        done < sensor-master.txt
    fi
done < user-list.csv