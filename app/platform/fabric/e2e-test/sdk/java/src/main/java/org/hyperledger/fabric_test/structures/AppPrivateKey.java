/*
 *SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric_test.structures;

import java.security.PrivateKey;

public class AppPrivateKey implements PrivateKey {
    @Override
    public String getAlgorithm() {
        return null;
    }

    @Override
    public String getFormat() {
        return null;
    }

    @Override
    public byte[] getEncoded() {
        return new byte[0];
    }
}
