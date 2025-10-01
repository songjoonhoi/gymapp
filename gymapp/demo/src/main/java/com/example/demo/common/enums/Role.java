package com.example.demo.common.enums;

public enum Role {
    OT, PT, TRAINER, ADMIN;

    public boolean isAdmin() {
        return this == ADMIN;
    }

    public boolean isTrainer() {
        return this == TRAINER;
    }

    public boolean isMember() {
        return this == OT || this == PT;
    }
}
