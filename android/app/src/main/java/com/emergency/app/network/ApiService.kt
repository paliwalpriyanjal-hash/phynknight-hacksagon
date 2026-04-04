package com.emergency.app.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

data class LoginRequest(val email: String, val password: String, val role: String)
data class LoginResponse(val token: String, val user: UserDto)
data class UserDto(val id: String, val email: String, val role: String, val name: String?)

data class EmergencyRequest(val name: String, val age: Int, val symptoms: List<String>, val location: String, val note: String)
data class EmergencyResponse(
    val _id: String, val riskLevel: String, val status: String, 
    val aiConfidence: Int, val symptoms: List<String>, val name: String,
    val location: String, val createdAt: String
)

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body req: LoginRequest): LoginResponse
    
    @POST("api/emergency/create")
    suspend fun createEmergency(@Header("Authorization") token: String, @Body req: EmergencyRequest): EmergencyResponse

    @GET("api/emergency/my")
    suspend fun getMyEmergencies(@Header("Authorization") token: String): List<EmergencyResponse>

    @GET("api/emergency/all")
    suspend fun getAllEmergencies(@Header("Authorization") token: String): List<EmergencyResponse>

    @PATCH("api/emergency/{id}/status")
    suspend fun updateStatus(@Header("Authorization") token: String, @Path("id") id: String, @Body body: Map<String, String>): EmergencyResponse

    @PATCH("api/emergency/{id}/assign-doctor")
    suspend fun assignDoctor(@Header("Authorization") token: String, @Path("id") id: String): EmergencyResponse
}

object RetrofitClient {
    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://10.0.2.2:5000/") 
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
