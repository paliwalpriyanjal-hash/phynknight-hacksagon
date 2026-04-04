package com.emergency.app.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.emergency.app.network.EmergencyResponse
import com.emergency.app.network.RetrofitClient
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {
    var token = mutableStateOf("")
    var role = mutableStateOf("")
    
    var emergencies = mutableStateOf<List<EmergencyResponse>>(emptyList())
    var isLoading = mutableStateOf(false)
    var errorMessage = mutableStateOf("")

    fun fetchHospitaData() {
        if (token.value.isEmpty()) return
        viewModelScope.launch {
            try {
                isLoading.value = true
                val list = RetrofitClient.api.getAllEmergencies("Bearer ${token.value}")
                emergencies.value = list
                isLoading.value = false
            } catch (e: Exception) {
                errorMessage.value = e.message ?: "Error fetching"
                isLoading.value = false
            }
        }
    }

    fun fetchPatientData() {
        if (token.value.isEmpty()) return
        viewModelScope.launch {
            try {
                isLoading.value = true
                val list = RetrofitClient.api.getMyEmergencies("Bearer ${token.value}")
                emergencies.value = list
                isLoading.value = false
            } catch (e: Exception) {
                errorMessage.value = e.message ?: "Error fetching"
                isLoading.value = false
            }
        }
    }
    
    fun updateStatus(id: String, newStatus: String) {
        viewModelScope.launch {
            try {
                RetrofitClient.api.updateStatus("Bearer ${token.value}", id, mapOf("status" to newStatus))
                fetchHospitaData()
            } catch (e: Exception) { }
        }
    }
    
    fun assignDoctor(id: String) {
        viewModelScope.launch {
            try {
                RetrofitClient.api.assignDoctor("Bearer ${token.value}", id)
                fetchHospitaData()
            } catch (e: Exception) { }
        }
    }
}
