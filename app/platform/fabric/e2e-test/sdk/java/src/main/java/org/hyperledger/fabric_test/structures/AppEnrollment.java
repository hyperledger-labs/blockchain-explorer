/*
 *SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric_test.structures;

import org.hyperledger.fabric.sdk.Enrollment;

import java.security.PrivateKey;

public class AppEnrollment implements Enrollment {
    private PrivateKey _key;
    private String _cert;

    @Override
    public PrivateKey getKey() {
        return _key;
    }

    @Override
    public String getCert() {
        return _cert;
    }
}
