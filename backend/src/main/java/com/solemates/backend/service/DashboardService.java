package com.solemates.backend.service;

import com.solemates.backend.dto.DashboardDTO;
import com.solemates.backend.dto.TransactionDTO;

public interface DashboardService {
    DashboardDTO getStats();

    void saveTransaction(TransactionDTO dto);
}
