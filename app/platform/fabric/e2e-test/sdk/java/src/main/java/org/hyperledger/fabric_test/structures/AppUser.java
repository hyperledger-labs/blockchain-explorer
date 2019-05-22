/*
 *SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric_test.structures;

import org.hyperledger.fabric.sdk.Enrollment;
import org.hyperledger.fabric.sdk.User;

import java.io.Serializable;
import java.util.Set;

public class AppUser implements User, Serializable {

    private static final long serializationid = 1141L;

    private String _name, _account, _affiliation, _mspId;
    private Set<String> _roles;
    private Enrollment _enrollment;

    public AppUser(String name, String affiliation, String mspId, Enrollment enrollment) {
        setName(name);
        setAffiliation(affiliation);
        setMspId(mspId);
        setEnrollment(enrollment);
    }

    public AppUser(String name, String affiliation, String mspId) {
        setName(name);
        setAffiliation(affiliation);
        setMspId(mspId);
    }

    @Override
    public String getName() {
        return _name;
    }

    public void setName(String name) {
        _name = name;
    }

    @Override
    public Set<String> getRoles() {
        return _roles;
    }

    public void setRoles(Set<String> roles) {
        _roles = roles;
    }

    @Override
    public String getAccount() {
        return _account;
    }

    public void setAccount(String account)  {
        _account = account;
    }

    @Override
    public String getAffiliation() {
        return _affiliation;
    }

    public void setAffiliation(String affiliation) {
        _affiliation = affiliation;
    }

    @Override
    public Enrollment getEnrollment() {
        return _enrollment;
    }

    public void setEnrollment(Enrollment enrollment) {
        _enrollment = enrollment;
    }

    @Override
    public String getMspId() {
        return _mspId;
    }

    public void setMspId(String mspId) {
        _mspId = mspId;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(
            "AppUser { \n"
                + "  name: " + _name + ", \n"
                + "  roles: [ \n"
        );
        if (_roles != null) {
            for (String role : _roles) {
                builder.append("    " + role + "\n");
            }
        }
        builder.append(
            "  ], \n"
                + "  account: " + _account + ", \n"
                + "  affiliation: " + _affiliation + ", \n"
                + "  mspId: " + _mspId + "\n"
                + "}"
        );

        return builder.toString();
    }
}
