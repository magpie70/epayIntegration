package com.epayIntegration.scheduler;

import com.epayIntegration.service.SynergyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledTask {

    private final SynergyService synergyService;

    @Scheduled(fixedRateString = "${task.interval}")
    public void runTask() {

        log.info("Epay Integration status update task started");

        synergyService.getDataExtByRegistryCode("new_pay");

        log.info("Epay Integration status update task finished");
    }
}
